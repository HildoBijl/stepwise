import { partition } from '@step-wise/js-utils'
import { type SkillSetup, ensureSetup } from '@step-wise/skill-setup'
import { type SkillId, type SkillTree, isSkillPrerequisiteOf, sortSkillIdsByTreeOrder } from '@step-wise/skill-definition'

import type { CourseData, CourseAnalysis, ResolvedCourseBlock, CourseBlockIssues } from './types'

export function analyzeCourse(skillTree: SkillTree, data: CourseData): CourseAnalysis {
	const { learningGoals: originalLearningGoals, startingPoints: originalStartingPoints } = data

	// Filter out unknown skills.
	const [learningGoalsFiltered, unknownLearningGoals] = partition(originalLearningGoals, skillId => Object.hasOwn(skillTree, skillId))
	const [startingPointsFiltered, unknownStartingPoints] = partition(originalStartingPoints, skillId => Object.hasOwn(skillTree, skillId))

	// Walk back from the learning goals to derive course contents and starting points.
	const contentsFound: SkillId[] = []
	const startingPointsFound: SkillId[] = []
	const missingStartingPoints: SkillId[] = []
	const superfluousLearningGoals: SkillId[] = []
	const processSkill = (skillId: SkillId, parentId: SkillId | undefined) => {
		// If we're out-of-tree (the skill does not follow from any starting point) then add the parent as a missing starting point.
		if (!startingPointsFiltered.some(startingPointId => isSkillPrerequisiteOf(skillTree, startingPointId, skillId))) {
			const missingStartingPoint = parentId ?? skillId
			if (!missingStartingPoints.includes(missingStartingPoint)) missingStartingPoints.push(missingStartingPoint)
			return
		}

		// Register learning goals that are required for other learning goals as superfluous.
		if (parentId !== undefined && learningGoalsFiltered.includes(skillId) && !superfluousLearningGoals.includes(skillId)) superfluousLearningGoals.push(skillId)

		// Remember which contents we found, so we don't double-process nodes.
		if (contentsFound.includes(skillId)) return
		contentsFound.push(skillId)

		// If we hit a starting point, only continue with those prerequisites that follow from another starting point.
		if (startingPointsFiltered.includes(skillId)) {
			startingPointsFound.push(skillId)
				skillTree[skillId].prerequisiteIds.forEach(prerequisiteId => {
				if (startingPointsFiltered.some(startingPointId => isSkillPrerequisiteOf(skillTree, startingPointId, prerequisiteId))) processSkill(prerequisiteId, skillId)
			})
			return
		}

		// Continue iterating with the prerequisites.
		skillTree[skillId].prerequisiteIds.forEach(prerequisiteId => processSkill(prerequisiteId, skillId))
	}
	learningGoalsFiltered.forEach(goalId => processSkill(goalId, undefined))

	// Determine the starting points and the errors in them.
	const externalStartingPoints = startingPointsFiltered.filter(skillId => !startingPointsFound.includes(skillId))
	const [superfluousStartingPoints, neededStartingPoints] = partition(startingPointsFound, skillId => skillTree[skillId].prerequisiteIds.length > 0 && skillTree[skillId].prerequisiteIds.every(prerequisiteId => contentsFound.includes(prerequisiteId)))
	const startingPoints = [...neededStartingPoints, ...missingStartingPoints]

	// Determine learning goals and the errors in them.
	const learningGoals = learningGoalsFiltered
	const learningGoalWeights = learningGoalsFiltered.map(goalId => data.goalWeights ? data.goalWeights![originalLearningGoals.indexOf(goalId)] : 1)

	// Determine prior knowledge: direct prerequisites of starting points outside the course.
	const priorKnowledge = sortSkillIdsByTreeOrder(skillTree, getPriorKnowledge(skillTree, startingPoints, contentsFound))

	// Resolve blocks. If no blocks are provided, create one implicit block for the course goals.
	let blocks: ResolvedCourseBlock[] | undefined, contents: SkillId[] | undefined, blockIssues: CourseBlockIssues[] | undefined, uncoveredLearningGoals: SkillId[] | undefined
	if (data.blockGoals) {
		[blocks, blockIssues, uncoveredLearningGoals] = analyzeCourseBlocks(skillTree, data.blockGoals, contentsFound, learningGoalsFiltered)
		if (uncoveredLearningGoals.length === 0) contents = blocks.flatMap(block => block.contents) // Sort contents by blocks.
	}
	if (!contents) contents = sortSkillIdsByTreeOrder(skillTree, contentsFound) // Sort contents by Skill Tree.

	// Check the set-up contents.
	let setup: SkillSetup | undefined, unknownSetupSkills: SkillId[] | undefined, externalSetupSkills: SkillId[] | undefined
	if (data.setup !== undefined) {
		setup = ensureSetup(data.setup)
		unknownSetupSkills = setup.getSkillList().filter(skillId => !Object.hasOwn(skillTree, skillId))
		externalSetupSkills = setup.getSkillList().filter(skillId => Object.hasOwn(skillTree, skillId) && !contentsFound.includes(skillId))
	}

	// Assemble the final analysis.
	return {
		course: {
			priorKnowledge,
			startingPoints,
			contents,
			allSkills: [...priorKnowledge, ...contents],

			learningGoals,
			learningGoalWeights,

			blocks,
			setup,
		},
		diagnostics: {
			originalStartingPoints,
			unknownStartingPoints,
			externalStartingPoints,
			superfluousStartingPoints,
			missingStartingPoints,

			originalLearningGoals,
			unknownLearningGoals,
			superfluousLearningGoals,

			blockIssues,
			uncoveredLearningGoals,

			unknownSetupSkills,
			externalSetupSkills,
		},
	}
}

// Take a Skill Tree, a set of starting points and a set of course contents and determine the prior knowledge.
function getPriorKnowledge(skillTree: SkillTree, startingPoints: SkillId[], contents: SkillId[]): SkillId[] {
	const priorKnowledge: SkillId[] = []
	startingPoints.forEach(startingPointId => {
		skillTree[startingPointId].prerequisiteIds.forEach(prerequisiteId => {
			if (!contents.includes(prerequisiteId) && !priorKnowledge.includes(prerequisiteId)) priorKnowledge.push(prerequisiteId)
		})
	})
	return priorKnowledge
}

function analyzeCourseBlocks(skillTree: SkillTree, blockGoals: readonly SkillId[][], allContents: readonly SkillId[], courseLearningGoals: readonly SkillId[]): [ResolvedCourseBlock[], CourseBlockIssues[], SkillId[]] {
	// Walk through all blocks to analyse them.
	const contentsSoFar: SkillId[] = []
	const blocks: ResolvedCourseBlock[] = [], blockIssues: CourseBlockIssues[] = []
	blockGoals.forEach(blockLearningGoals => {
		// Set up a handler to add to the block contents.
		const contents: SkillId[] = [], unknownLearningGoals: SkillId[] = [], externalLearningGoals: SkillId[] = [], superfluousLearningGoals: SkillId[] = []
		const addSkill = (skillId: SkillId) => {
			if (!Object.hasOwn(skillTree, skillId)) return
			const skill = skillTree[skillId]
			if (!allContents.includes(skillId) || contentsSoFar.includes(skillId)) return
			contentsSoFar.push(skillId)
			skill.prerequisiteIds.forEach(addSkill)
			contents.push(skillId)
		}

		// Walk through the learning goals to check them, and if valid add their contents.
		blockLearningGoals.forEach(blockLearningGoal => {
			if (!Object.hasOwn(skillTree, blockLearningGoal)) unknownLearningGoals.push(blockLearningGoal)
			else if (!allContents.includes(blockLearningGoal)) externalLearningGoals.push(blockLearningGoal)
			else if (contentsSoFar.includes(blockLearningGoal)) superfluousLearningGoals.push(blockLearningGoal)
			else addSkill(blockLearningGoal)
		})

		// Add block and blockIssue results.
		blocks.push({ learningGoals: blockLearningGoals.filter(goal => allContents.includes(goal)), contents })
		blockIssues.push({ unknownLearningGoals, externalLearningGoals, superfluousLearningGoals })
	})

	// All done! Return the final result.
	const uncoveredLearningGoals = courseLearningGoals.filter(goal => !contentsSoFar.includes(goal))
	return [blocks, blockIssues, uncoveredLearningGoals]
}
