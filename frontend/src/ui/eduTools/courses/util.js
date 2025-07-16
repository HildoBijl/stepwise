import { sortByIndices } from 'step-wise/util'
import { skillTree } from 'step-wise/eduTools'

import { isPracticeNeeded } from '../skills'

// getOverview takes a course set-up and returns an overview object { priorKnowledge: ['priorSkill1', ...], course: ['firstSkill', ..., 'lastSkill'], blocks: [['firstSkill', ...], ..., [..., 'lastSkill']], goals: [...], all: ['priorSkill1', ..., 'firstSkill', ...] }. It lists all the skills belonging to the course in the right order.
// ToDo: remove this function. It's deprecated, with a function in the shared folder doing this better.
export function getOverview(courseSetup) {
	// Check input.
	if (!courseSetup)
		return { priorKnowledge: [], goals: [], blocks: [], course: [], all: [] }

	// Fill up all the skill sets.
	const { blocks, priorKnowledge } = courseSetup
	const courseSet = new Set()
	const priorKnowledgeSet = new Set()
	const blockSets = blocks.map(block => {
		const blockSet = new Set()
		block.goals.forEach(goal => addToSkillSets(goal, priorKnowledge, courseSet, blockSet, priorKnowledgeSet))
		return blockSet
	})

	// Sort the prior knowledge by the order of the skills object. This prevents some funky situations when later on we encounter a prior-knowledge-skill that is a subskill of a skill of an earlier-encountered prior knowledge skill.
	const allSkillIds = Object.keys(skillTree)
	const indices = priorKnowledge.map(skillId => allSkillIds.indexOf(skillId))
	const priorKnowledgeSorted = sortByIndices(priorKnowledge, indices)

	// Return all sets as arrays.
	return {
		priorKnowledge: priorKnowledgeSorted, // Use the prior knowledge sorted according to the skill tree file instead.
		goals: courseSetup.goals,
		blocks: blockSets.map(blockSet => [...blockSet]),
		course: [...courseSet],
		all: [...priorKnowledgeSet, ...courseSet],
	}
}

function addToSkillSets(skillId, priorKnowledge, courseSet, blockSet, priorKnowledgeSet) {
	// If we already added this skill, don't add it again. This prevents multiple blocks to have the same skill.
	if (courseSet.has(skillId))
		return

	// If this skill is prior knowledge, we don't need to learn it. Do add it to the prior knowledge set so we know in which order we should go through prior knowledge.
	if (priorKnowledge.includes(skillId)) {
		priorKnowledgeSet.add(skillId)
		return
	}

	// Recursively add prerequisites.
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)
	if (skill.prerequisites)
		skill.prerequisites.forEach(prerequisiteId => addToSkillSets(prerequisiteId, priorKnowledge, courseSet, blockSet, priorKnowledgeSet))

	// Add this skill to the sets.
	courseSet.add(skillId)
	blockSet.add(skillId)
}

// getAnalysis checks, for a given course overview and a given set of skills data, which skills have been mastered and which skill is recommended to practice next. It returns an object of the form { practiceNeeded: { skill1: 2, skill2: 0, skill3: 1, ... }, recommendation: 'skill2' }. The recommendation can also be undefined (not enough data loaded yet) or the freePractice string.
const strFreePractice = 'StepWiseFreePracticeMode'
export { strFreePractice }
export function getAnalysis(processedCourse, skillsData) {
	const practiceNeeded = getPracticeNeeded(processedCourse, skillsData)

	// Check if there are still undefined practiceNeeded. Then not all data is loaded yet. Return undefined as recommendation.
	if (processedCourse.all.some(skillId => practiceNeeded[skillId] === undefined))
		return undefined

	// Check for possible recommendations: first for work needed in prior knowledge and then for work needed in the course skills. Also ensure that this recommendation has exercises that can be practiced.
	let recommendation = processedCourse.priorKnowledge.find(skillId => practiceNeeded[skillId] === 2 && skillTree[skillId].exercises.length > 0)
	if (!recommendation)
		recommendation = processedCourse.contents.find(skillId => practiceNeeded[skillId] === 2 && skillTree[skillId].exercises.length > 0)
	if (!recommendation)
		recommendation = processedCourse.contents.find(skillId => practiceNeeded[skillId] === 1 && skillTree[skillId].exercises.length > 0)

	// If no recommendation has been found, then all skills are mastered. Recommend free practice.
	if (!recommendation)
		recommendation = strFreePractice

	// Return the outcome.
	return {
		practiceNeeded,
		recommendation,
	}
}

// getPracticeNeeded takes a course set-up and walks through it to determine which skills require practice. It returns an object { skill1: 2, skill2: 0, skill3: 1, ... } which indicates the practice-needed-index for each skill in the course (including prior knowledge skills). It also takes into account the skill hierarchy: if a main skill X has an index (for instance "1") then all subskills have AT MOST that index, possibly lower.
function getPracticeNeeded(processedCourse, skillsData) {
	const result = {}
	processedCourse.goals.forEach(goalId => checkPracticeNeeded(goalId, skillsData, processedCourse.priorKnowledge, result))
	return result
}

function checkPracticeNeeded(skillId, skillsData = {}, priorKnowledge, result, bestParent) {
	// Extract the skill from the skill tree.
	const skill = skillTree[skillId]
	if (!skill)
		throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)

	// Derive data about this skill.
	const isPriorKnowledge = priorKnowledge.includes(skillId)
	let practiceNeeded = isPracticeNeeded(skillsData[skillId], isPriorKnowledge, skill.thresholds)
	if (bestParent !== undefined && practiceNeeded !== undefined)
		practiceNeeded = Math.min(bestParent, practiceNeeded)

	// If this was already known, end the iteration. Otherwise store the result.
	if (result[skillId] !== undefined && practiceNeeded !== undefined && result[skillId] <= practiceNeeded)
		return
	result[skillId] = practiceNeeded

	// Store, and recursively add prerequisites.
	if (!isPriorKnowledge && skill.prerequisites)
		skill.prerequisites.forEach(prerequisiteId => checkPracticeNeeded(prerequisiteId, skillsData, priorKnowledge, result, practiceNeeded))
}
