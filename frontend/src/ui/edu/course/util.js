import skills from 'step-wise/edu/skills'

import { isPracticeNeeded } from '../skills/util'

// getOverview takes a course set-up and returns an overview object { priorKnowledge: ['priorSkill1', ...], course: ['firstSkill', ..., 'lastSkill'], blocks: [['firstSkill', ...], ..., [..., 'lastSkill']], goals: [...], all: ['priorSkill1', ..., 'firstSkill', ...] }. It lists all the skills belonging to the course in the right order.
export function getOverview(courseSetup) {
	// Check input.
	if (!courseSetup)
		return { priorKnowledge: [], blocks: [], course: [] }

	// Fill up all the skill sets.
	const { blocks, priorKnowledge } = courseSetup
	const courseSet = new Set()
	const priorKnowledgeSet = new Set()
	const blockSets = blocks.map(block => {
		const blockSet = new Set()
		block.goals.forEach(goal => addToSkillSets(goal, priorKnowledge, courseSet, blockSet, priorKnowledgeSet))
		return blockSet
	})

	// Sort the prior knowledge by the order of the skills object. This prevents some funky situations when later on we encounter a prior-knowledge-skill that is a subskills of a skill an earlier-encountered skill.
	const allSkillIds = Object.keys(skills)
	const indices = priorKnowledge.map(skillId => allSkillIds.indexOf(skillId)).sort((a, b) => a - b)
	const priorKnowledgeSorted = indices.map(index => allSkillIds[index])

	// Return all sets as arrays.
	return {
		// priorKnowledge: [...priorKnowledgeSet], // Using the prior knowledge set puts the prior knowledge skills in the order which they're encountered in. This results in some weird situations where later on we encounter a prerequisite of an earlier prior knowledge skill. So it's better not to use it.
		priorKnowledge: priorKnowledgeSorted, // Use the prior knowledge sorted according to the skill tree file instead. It's cleaner. Optionally, we could traverse the tree to see which prior knowledge skills are children of which other prior knowledge skills, but that's computationally more of a challenge.
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
	const skill = skills[skillId]
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
export function getAnalysis(overview, skillsData) {
	const practiceNeeded = getPracticeNeeded(overview, skillsData)

	// Check if there are still undefined practiceNeeded. Then not all data is loaded yet. Return undefined as recommendation.
	if (overview.all.some(skillId => practiceNeeded[skillId] === undefined))
		return { practiceNeeded }

	// Check for possible recommendations: first for work needed in prior knowledge and then for work needed in the course skills.
	let recommendation = overview.priorKnowledge.find(skillId => practiceNeeded[skillId] === 2)
	if (!recommendation)
		recommendation = overview.course.find(skillId => practiceNeeded[skillId] === 2)
	if (!recommendation)
		recommendation = overview.course.find(skillId => practiceNeeded[skillId] === 1)

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
function getPracticeNeeded(overview, skillsData) {
	const result = {}
	overview.goals.forEach(goal => checkPracticeNeeded(goal, skillsData, overview.priorKnowledge, result))
	return result
}

function checkPracticeNeeded(skillId, skillsData = {}, priorKnowledge, result, bestParent) {
	// Derive data about this skill.
	const isPriorKnowledge = priorKnowledge.includes(skillId)
	let practiceNeeded = isPracticeNeeded(skillsData[skillId], isPriorKnowledge)
	if (bestParent !== undefined && practiceNeeded !== undefined)
		practiceNeeded = Math.min(bestParent, practiceNeeded)

	// If this was already known, end the iteration. Otherwise store the result.
	if (result[skillId] !== undefined && practiceNeeded !== undefined && result[skillId] <= practiceNeeded)
		return
	result[skillId] = practiceNeeded

	// Store, and recursively add prerequisites.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)
	if (!isPriorKnowledge && skill.prerequisites)
		skill.prerequisites.forEach(prerequisiteId => checkPracticeNeeded(prerequisiteId, skillsData, priorKnowledge, result, practiceNeeded))
}