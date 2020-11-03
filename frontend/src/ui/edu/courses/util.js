import skills from 'step-wise/edu/skills'

import { isPracticeNeeded } from '../skills/util'

// getCourseSkills takes a course set-up and returns an object { priorKnowledge: ['priorSkill1', ...], course: ['firstSkill', ..., 'lastSkill'], blocks: [['firstSkill', ...], ..., [..., 'lastSkill']] }. It lists all the skills belonging to the course in the right order.
// If skillsData is given, it only lists the skills with practice needed. If no skillsData is given, all skills are listed. Note: if a skill X is completed but subskills A and B do have practice needed, then iteration is stopped at X, ignoring A and B. After all, if X is mastered, why would the student need to practice A and B? (Unless another skill that is not completed also requires A and/or B.)
export function getCourseSkills(courseSetup, skillsData) {
	// Check input.
	if (!courseSetup)
		return { priorKnowledge: [], blocks: [], course: [] }

	const { blocks, priorKnowledge } = courseSetup
	const courseSet = new Set()
	const priorKnowledgeSet = new Set()
	const blockSets = blocks.map(block => {
		const blockSet = new Set()
		block.goals.forEach(goal => addToSkillSets(goal, priorKnowledge, courseSet, blockSet, priorKnowledgeSet, skillsData))
		return blockSet
	})

	return {
		priorKnowledge: [...priorKnowledgeSet],
		blocks: blockSets.map(blockSet => [...blockSet]),
		course: [...courseSet],
	}
}

function addToSkillSets(skillId, priorKnowledge, courseSet, blockSet, priorKnowledgeSet, skillsData = {}) {
	// If skills data are given, then only examine skills with practice needed. Ignore otherwise.
	const isPriorKnowledge = priorKnowledge.includes(skillId)
	if (skillsData && skillsData[skillId] && !isPracticeNeeded(skillsData[skillId], isPriorKnowledge))
		return

	// If this skill is prior knowledge, we don't need to learn it. Do add it to the prior knowledge set so we know in which order we should go through prior knowledge.
	if (isPriorKnowledge) {
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
		skill.prerequisites.forEach(prerequisiteId => addToSkillSets(prerequisiteId, priorKnowledge, courseSet, blockSet, priorKnowledgeSet, skillsData))

	// Add this skill to the sets.
	courseSet.add(skillId)
	blockSet.add(skillId)
}