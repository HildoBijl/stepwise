import skills from 'step-wise/edu/skills'

import { isPracticeNeeded } from '../skills/util'

// getSkillOverview takes a course set-up and returns an object { priorKnowledge: ['priorSkill1', ...], course: ['firstSkill', ..., 'lastSkill'], blocks: [['firstSkill', ...], ..., [..., 'lastSkill']] }. It lists all the skills belonging to the course in the right order.
export function getSkillOverview(courseSetup) {
	// Check input.
	if (!courseSetup)
		return { priorKnowledge: [], blocks: [], course: [] }

	const { blocks, priorKnowledge } = courseSetup
	const courseSet = new Set()
	const priorKnowledgeSet = new Set()
	const blockSets = blocks.map(block => {
		const blockSet = new Set()
		block.goals.forEach(goal => addToSkillSets(goal, priorKnowledge, courseSet, blockSet, priorKnowledgeSet))
		return blockSet
	})

	return {
		priorKnowledge: [...priorKnowledgeSet],
		blocks: blockSets.map(blockSet => [...blockSet]),
		course: [...courseSet],
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

// getMasteredSkills takes a course, walks from the goals all the way up to the prior knowledge, and checks which skills are mastered. A skill is also marked as mastered if a follow-up skill (directly or indirectly) is mastered. So in theory, if a student only masters the course goals and nothing else, all skills are marked as mastered. It returns an object with two lists: { priorKnowledge: ['firstMasteredSkill', 'secondMasteredSkill', ...], course: ['anotherMasteredSkill', ...] }.
export function getMasteredSkills(courseSetup, skillsData) {
	// Set up sets to add skills to.
	const courseSet = new Set()
	const priorKnowledgeSet = new Set()

	// Recursively walk through skills.
	courseSetup.goals.forEach(goal => checkMastery(goal, courseSetup.priorKnowledge, skillsData, false, courseSet, priorKnowledgeSet))

	// Return the filled lists.
	return {
		priorKnowledge: [...priorKnowledgeSet],
		course: [...courseSet],
	}
}

function checkMastery(skillId, priorKnowledge, skillsData, parentMastered = false, courseSet, priorKnowledgeSet) {
	// Derive data about this skill.
	const isPriorKnowledge = priorKnowledge.includes(skillId)
	const mastered = parentMastered || (skillsData && skillsData[skillId] && !isPracticeNeeded(skillsData[skillId], isPriorKnowledge))

	// Ignore previously seen (and mastered) skills.
	const relevantSet = (isPriorKnowledge ? priorKnowledgeSet : courseSet)
	if (relevantSet.has(skillId))
		return

	// Recursively add prerequisites.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)
	if (!isPriorKnowledge && skill.prerequisites)
		skill.prerequisites.forEach(prerequisiteId => checkMastery(prerequisiteId, priorKnowledge, skillsData, mastered, courseSet, priorKnowledgeSet))

	// If needed, add this skill to the set.
	if (mastered)
		relevantSet.add(skillId)
}

// isSkillMastered gets a masteredSkills object and checks if the given skillId is in it.
export function isSkillMastered(skillId, masteredSkills) {
	return masteredSkills.course.includes(skillId) || masteredSkills.priorKnowledge.includes(skillId)
}
