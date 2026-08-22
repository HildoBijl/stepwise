import { partition } from '@step-wise/js-utils'
import { type SkillSetup, ensureSetup } from '@step-wise/skill-setup'
import { type SkillId, type SkillTree, isSkillPrerequisiteOf, sortSkillIdsByTreeOrder } from '@step-wise/skill-definition'

import type { CourseAnalysis, CourseBlockDiagnostics, CourseDefinition, CourseResolutionBlock } from './types'

export function analyzeCourse(skillTree: SkillTree, definition: CourseDefinition): CourseAnalysis {
	const { learningGoalIds: originalLearningGoalIds, startingPointIds: originalStartingPointIds } = definition

	// Filter out unknown skills.
	const [learningGoalIdsFiltered, unknownLearningGoalIds] = partition(originalLearningGoalIds, skillId => Object.hasOwn(skillTree, skillId))
	const [startingPointIdsFiltered, unknownStartingPointIds] = partition(originalStartingPointIds, skillId => Object.hasOwn(skillTree, skillId))

	// Walk back from the learning goals to derive course contents and starting points.
	const contentsFound: SkillId[] = []
	const startingPointIdsFound: SkillId[] = []
	const missingStartingPointIds: SkillId[] = []
	const redundantLearningGoalIds: SkillId[] = []
	const processSkill = (skillId: SkillId, parentId: SkillId | undefined) => {
		// If we're out-of-tree (the skill does not follow from any starting point) then add the parent as a missing starting point.
		if (!startingPointIdsFiltered.some(startingPointId => isSkillPrerequisiteOf(skillTree, startingPointId, skillId))) {
			const missingStartingPoint = parentId ?? skillId
			if (!missingStartingPointIds.includes(missingStartingPoint)) missingStartingPointIds.push(missingStartingPoint)
			return
		}

		// Register learning goals that are required for other learning goals as redundant.
		if (parentId !== undefined && learningGoalIdsFiltered.includes(skillId) && !redundantLearningGoalIds.includes(skillId)) redundantLearningGoalIds.push(skillId)

		// Remember which contents we found, so we don't double-process nodes.
		if (contentsFound.includes(skillId)) return
		contentsFound.push(skillId)

		// If we hit a starting point, only continue with those prerequisites that follow from another starting point.
		if (startingPointIdsFiltered.includes(skillId)) {
			startingPointIdsFound.push(skillId)
			skillTree[skillId].prerequisiteIds.forEach(prerequisiteId => {
				if (startingPointIdsFiltered.some(startingPointId => isSkillPrerequisiteOf(skillTree, startingPointId, prerequisiteId))) processSkill(prerequisiteId, skillId)
			})
			return
		}

		// Continue iterating with the prerequisites.
		skillTree[skillId].prerequisiteIds.forEach(prerequisiteId => processSkill(prerequisiteId, skillId))
	}
	learningGoalIdsFiltered.forEach(goalId => processSkill(goalId, undefined))

	// Determine the starting points and the errors in them.
	const externalStartingPointIds = startingPointIdsFiltered.filter(skillId => !startingPointIdsFound.includes(skillId))
	const [redundantStartingPointIds, neededStartingPointIds] = partition(startingPointIdsFound, skillId => skillTree[skillId].prerequisiteIds.length > 0 && skillTree[skillId].prerequisiteIds.every(prerequisiteId => contentsFound.includes(prerequisiteId)))
	const startingPointIds = [...neededStartingPointIds, ...missingStartingPointIds]

	// Determine learning goals and the errors in them.
	const learningGoalIds = learningGoalIdsFiltered
	const learningGoalWeights = learningGoalIdsFiltered.map(goalId => definition.learningGoalWeights ? definition.learningGoalWeights[originalLearningGoalIds.indexOf(goalId)] : 1)

	// Determine prior knowledge: direct prerequisites of starting points outside the course.
	const priorKnowledgeIds = sortSkillIdsByTreeOrder(skillTree, getPriorKnowledgeIds(skillTree, startingPointIds, contentsFound))

	// Resolve blocks. If no blocks are provided, create one implicit block for the course goals.
	let blocks: CourseResolutionBlock[] | undefined, contentSkillIds: SkillId[] | undefined, blockDiagnostics: CourseBlockDiagnostics[] | undefined, uncoveredLearningGoalIds: SkillId[] | undefined
	if (definition.blockLearningGoalIds) {
		[blocks, blockDiagnostics, uncoveredLearningGoalIds] = analyzeCourseBlocks(skillTree, definition.blockLearningGoalIds, contentsFound, learningGoalIdsFiltered)
		if (uncoveredLearningGoalIds.length === 0) contentSkillIds = blocks.flatMap(block => block.contentSkillIds) // Sort contents by blocks.
	}
	if (!contentSkillIds) contentSkillIds = sortSkillIdsByTreeOrder(skillTree, contentsFound) // Sort contents by Skill Tree.

	// Check the set-up contents.
	let setup: SkillSetup | undefined, unknownSetupSkillIds: SkillId[] | undefined, externalSetupSkillIds: SkillId[] | undefined
	if (definition.setup !== undefined) {
		setup = ensureSetup(definition.setup)
		unknownSetupSkillIds = setup.getSkillList().filter(skillId => !Object.hasOwn(skillTree, skillId))
		externalSetupSkillIds = setup.getSkillList().filter(skillId => Object.hasOwn(skillTree, skillId) && !contentsFound.includes(skillId))
	}

	// Assemble the final analysis.
	return {
		resolution: {
			priorKnowledgeIds,
			startingPointIds,
			contentSkillIds,
			allSkillIds: [...priorKnowledgeIds, ...contentSkillIds],

			learningGoalIds,
			learningGoalWeights,

			blocks,
			setup,
		},
		diagnostics: {
			originalStartingPointIds,
			unknownStartingPointIds,
			externalStartingPointIds,
			redundantStartingPointIds,
			missingStartingPointIds,

			originalLearningGoalIds,
			unknownLearningGoalIds,
			redundantLearningGoalIds,

			blockDiagnostics,
			uncoveredLearningGoalIds,

			unknownSetupSkillIds,
			externalSetupSkillIds,
		},
	}
}

// Take a Skill Tree, a set of starting points and a set of course contents and determine the prior knowledge.
function getPriorKnowledgeIds(skillTree: SkillTree, startingPointIds: readonly SkillId[], contentSkillIds: readonly SkillId[]): SkillId[] {
	const priorKnowledgeIds: SkillId[] = []
	startingPointIds.forEach(startingPointId => {
		skillTree[startingPointId].prerequisiteIds.forEach(prerequisiteId => {
			if (!contentSkillIds.includes(prerequisiteId) && !priorKnowledgeIds.includes(prerequisiteId)) priorKnowledgeIds.push(prerequisiteId)
		})
	})
	return priorKnowledgeIds
}

function analyzeCourseBlocks(skillTree: SkillTree, blockLearningGoalIds: readonly (readonly SkillId[])[], allContentSkillIds: readonly SkillId[], courseLearningGoalIds: readonly SkillId[]): [CourseResolutionBlock[], CourseBlockDiagnostics[], SkillId[]] {
	// Walk through all blocks to analyse them.
	const contentSkillIdsSoFar: SkillId[] = []
	const blocks: CourseResolutionBlock[] = [], blockDiagnostics: CourseBlockDiagnostics[] = []
	blockLearningGoalIds.forEach(learningGoalIds => {
		// Set up a handler to add to the block contents.
		const contentSkillIds: SkillId[] = [], unknownLearningGoalIds: SkillId[] = [], externalLearningGoalIds: SkillId[] = [], redundantLearningGoalIds: SkillId[] = []
		const addSkill = (skillId: SkillId) => {
			if (!Object.hasOwn(skillTree, skillId)) return
			const skill = skillTree[skillId]
			if (!allContentSkillIds.includes(skillId) || contentSkillIdsSoFar.includes(skillId)) return
			contentSkillIdsSoFar.push(skillId)
			skill.prerequisiteIds.forEach(addSkill)
			contentSkillIds.push(skillId)
		}

		// Walk through the learning goals to check them, and if valid add their contents.
		learningGoalIds.forEach(learningGoalId => {
			if (!Object.hasOwn(skillTree, learningGoalId)) unknownLearningGoalIds.push(learningGoalId)
			else if (!allContentSkillIds.includes(learningGoalId)) externalLearningGoalIds.push(learningGoalId)
			else if (contentSkillIdsSoFar.includes(learningGoalId)) redundantLearningGoalIds.push(learningGoalId)
			else addSkill(learningGoalId)
		})

		// Add the block and its diagnostics.
		blocks.push({ learningGoalIds: learningGoalIds.filter(skillId => allContentSkillIds.includes(skillId)), contentSkillIds })
		blockDiagnostics.push({ unknownLearningGoalIds, externalLearningGoalIds, redundantLearningGoalIds })
	})

	// All done! Return the final result.
	const uncoveredLearningGoalIds = courseLearningGoalIds.filter(skillId => !contentSkillIdsSoFar.includes(skillId))
	return [blocks, blockDiagnostics, uncoveredLearningGoalIds]
}
