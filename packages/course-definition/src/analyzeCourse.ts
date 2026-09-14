import { partition } from '@step-wise/js-utils'
import { type SkillSetup, ensureSetup } from '@step-wise/skill-setup'
import { type ModuleTree, type SkillId, getSkill, isModulePrerequisiteOf, sortModuleIdsByTreeOrder } from '@step-wise/module-tree-definition'

import type { CourseAnalysis, CourseBlockDiagnostics, CourseResolutionBlock, CourseSpecification } from './types.ts'

export function analyzeCourse(moduleTree: ModuleTree, specification: CourseSpecification): CourseAnalysis {
	const { learningGoalIds: originalLearningGoalIds, startingPointIds: originalStartingPointIds } = specification

	// Filter out unknown skills.
	const isKnownSkillId = (skillId: SkillId) => Object.hasOwn(moduleTree, skillId) && moduleTree[skillId].type === 'skill'
	const [learningGoalIdsFiltered, unknownLearningGoalIds] = partition(originalLearningGoalIds, isKnownSkillId)
	const [startingPointIdsFiltered, unknownStartingPointIds] = partition(originalStartingPointIds, isKnownSkillId)

	// Walk back from the learning goals to derive course contents and starting points.
	const contentsFound: SkillId[] = []
	const startingPointIdsFound: SkillId[] = []
	const missingStartingPointIds: SkillId[] = []
	const redundantLearningGoalIds: SkillId[] = []
	const processSkill = (skillId: SkillId, parentId: SkillId | undefined) => {
		const skill = getSkill(moduleTree, skillId)
		// If we're out-of-tree (the skill does not follow from any starting point) then add the parent as a missing starting point.
		if (!startingPointIdsFiltered.some(startingPointId => isModulePrerequisiteOf(moduleTree, startingPointId, skillId, { includeConcepts: false }))) {
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
			skill.prerequisiteIds.forEach(prerequisiteId => {
				if (moduleTree[prerequisiteId].type === 'skill' && startingPointIdsFiltered.some(startingPointId => isModulePrerequisiteOf(moduleTree, startingPointId, prerequisiteId, { includeConcepts: false }))) processSkill(prerequisiteId, skillId)
			})
			return
		}

		// Continue iterating with the prerequisites.
		skill.prerequisiteIds.forEach(prerequisiteId => {
			if (moduleTree[prerequisiteId].type === 'skill') processSkill(prerequisiteId, skillId)
		})
	}
	learningGoalIdsFiltered.forEach(goalId => processSkill(goalId, undefined))

	// Determine the starting points and the errors in them.
	const externalStartingPointIds = startingPointIdsFiltered.filter(skillId => !startingPointIdsFound.includes(skillId))
	const [redundantStartingPointIds, neededStartingPointIds] = partition(startingPointIdsFound, skillId => {
		const prerequisiteSkillIds = getSkill(moduleTree, skillId).prerequisiteIds.filter(prerequisiteId => moduleTree[prerequisiteId].type === 'skill')
		return prerequisiteSkillIds.length > 0 && prerequisiteSkillIds.every(prerequisiteId => contentsFound.includes(prerequisiteId))
	})
	const startingPointIds = [...neededStartingPointIds, ...missingStartingPointIds]

	// Determine learning goals and the errors in them.
	const learningGoalIds = learningGoalIdsFiltered
	const learningGoalWeights = learningGoalIdsFiltered.map(goalId => specification.learningGoalWeights ? specification.learningGoalWeights[originalLearningGoalIds.indexOf(goalId)] : 1)

	// Determine prior knowledge: direct prerequisites of starting points outside the course.
	const priorKnowledgeIds = sortModuleIdsByTreeOrder(moduleTree, getPriorKnowledgeIds(moduleTree, startingPointIds, contentsFound), { includeConcepts: false })

	// Resolve blocks. If no blocks are provided, create one implicit block for the course goals.
	let blocks: CourseResolutionBlock[] | undefined, contentSkillIds: SkillId[] | undefined, blockDiagnostics: CourseBlockDiagnostics[] | undefined, uncoveredLearningGoalIds: SkillId[] | undefined
	if (specification.blockLearningGoalIds) {
		[blocks, blockDiagnostics, uncoveredLearningGoalIds] = analyzeCourseBlocks(moduleTree, specification.blockLearningGoalIds, contentsFound, learningGoalIdsFiltered)
		if (uncoveredLearningGoalIds.length === 0) contentSkillIds = blocks.flatMap(block => block.contentSkillIds) // Sort contents by blocks.
	}
	if (!contentSkillIds) contentSkillIds = sortModuleIdsByTreeOrder(moduleTree, contentsFound, { includeConcepts: false }) // Sort contents by module-tree order.

	// Check the set-up contents.
	let setup: SkillSetup | undefined, unknownSetupSkillIds: SkillId[] | undefined, externalSetupSkillIds: SkillId[] | undefined
	if (specification.setup !== undefined) {
		setup = ensureSetup(specification.setup)
		unknownSetupSkillIds = setup.getSkillList().filter(skillId => !isKnownSkillId(skillId))
		externalSetupSkillIds = setup.getSkillList().filter(skillId => isKnownSkillId(skillId) && !contentsFound.includes(skillId))
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
function getPriorKnowledgeIds(moduleTree: ModuleTree, startingPointIds: readonly SkillId[], contentSkillIds: readonly SkillId[]): SkillId[] {
	const priorKnowledgeIds: SkillId[] = []
	startingPointIds.forEach(startingPointId => {
		getSkill(moduleTree, startingPointId).prerequisiteIds.forEach(prerequisiteId => {
			if (moduleTree[prerequisiteId].type === 'skill' && !contentSkillIds.includes(prerequisiteId) && !priorKnowledgeIds.includes(prerequisiteId)) priorKnowledgeIds.push(prerequisiteId)
		})
	})
	return priorKnowledgeIds
}

function analyzeCourseBlocks(moduleTree: ModuleTree, blockLearningGoalIds: readonly (readonly SkillId[])[], allContentSkillIds: readonly SkillId[], courseLearningGoalIds: readonly SkillId[]): [CourseResolutionBlock[], CourseBlockDiagnostics[], SkillId[]] {
	// Walk through all blocks to analyse them.
	const contentSkillIdsSoFar: SkillId[] = []
	const blocks: CourseResolutionBlock[] = [], blockDiagnostics: CourseBlockDiagnostics[] = []
	blockLearningGoalIds.forEach(learningGoalIds => {
		// Set up a handler to add to the block contents.
		const contentSkillIds: SkillId[] = [], unknownLearningGoalIds: SkillId[] = [], externalLearningGoalIds: SkillId[] = [], redundantLearningGoalIds: SkillId[] = []
		const addSkill = (skillId: SkillId) => {
			if (!Object.hasOwn(moduleTree, skillId)) return
			const skill = getSkill(moduleTree, skillId)
			if (!allContentSkillIds.includes(skillId) || contentSkillIdsSoFar.includes(skillId)) return
			contentSkillIdsSoFar.push(skillId)
			skill.prerequisiteIds.forEach(prerequisiteId => {
				if (moduleTree[prerequisiteId].type === 'skill') addSkill(prerequisiteId)
			})
			contentSkillIds.push(skillId)
		}

		// Walk through the learning goals to check them, and if valid add their contents.
		learningGoalIds.forEach(learningGoalId => {
			if (!Object.hasOwn(moduleTree, learningGoalId)) unknownLearningGoalIds.push(learningGoalId)
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
