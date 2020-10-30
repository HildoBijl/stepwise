// This file contains various utility files for processing course set-ups.
import skills from 'step-wise/edu/skills'

// getCourseSkills takes a course set-up and returns an object { priorKnowledge: ['priorSkill1', ...], course: ['firstSkill', ..., 'lastSkill'], blocks: [['firstSkill', ...], ..., [..., 'lastSkill']] }. It lists all the skills belonging to the course in the right order.
export function getCourseSkills(courseSetup) {
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
	// If this skill is prior knowledge, we don't need to learn it. Do add it to the prior knowledge set so we know in which order we should go through prior knowledge.
	if (priorKnowledge.includes(skillId)) {
		priorKnowledgeSet.add(skillId)
		return
	}
	// If we already added this skill, don't add it again.
	if (courseSet.has(skillId))
		return

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