import courses from '../ui/edu/courses'
import skills from 'step-wise/edu/skills'
import { hasDuplicates } from 'step-wise/util/arrays'

describe('Check all courses:', () => {
	Object.keys(courses).forEach(key => {
		const course = courses[key]
		describe(key, () => {

			// Test the general format.

			it('has an id matching its key', () => {
				expect(courses[key].id).toBe(key)
			})

			it('has a name', () => {
				expect(typeof course.name).toBe('string')
			})

			it('has a non-empty goals array with existing skills', () => {
				expect(Array.isArray(course.goals)).toBe(true)
				expect(course.goals).not.toHaveLength(0)
				expect(hasDuplicates(course.goals)).toBe(false)
				course.goals.forEach(goal => {
					expect(typeof skills[goal]).toBe('object')
				})
			})

			it('has a prior knowledge array with existing skills', () => {
				expect(Array.isArray(course.priorKnowledge)).toBe(true)
				expect(hasDuplicates(course.priorKnowledge)).toBe(false)
				course.priorKnowledge.forEach(priorKnowledge => {
					expect(typeof skills[priorKnowledge]).toBe('object')
				})
			})

			it('has a starting points array with existing skills', () => {
				expect(Array.isArray(course.startingPoints)).toBe(true)
				expect(hasDuplicates(course.startingPoints)).toBe(false)
				course.startingPoints.forEach(startingPoint => {
					expect(typeof skills[startingPoint]).toBe('object')
				})
			})

			it('has blocks with a name and existing skills', () => {
				expect(Array.isArray(course.blocks)).toBe(true)
				expect(course.blocks).not.toHaveLength(0)
				course.blocks.forEach(block => {
					expect(typeof block).toBe('object')
					expect(typeof block.name).toBe('string')
					expect(Array.isArray(block.goals)).toBe(true)
					// expect(block.goals).not.toHaveLength(0)
					expect(hasDuplicates(block.goals)).toBe(false)
					block.goals.forEach(goal => {
						expect(typeof skills[goal]).toBe('object')
					})
				})
			})

			// Check missing or superfluous skills in the general course.

			it('has no superfluous goals', () => {
				expect(() => getSkillSets(course.goals, course.priorKnowledge)).not.toThrow()
			})

			it('has no superfluous prior knowledge', () => {
				const { priorKnowledgeSet } = getSkillSets(course.goals, course.priorKnowledge)
				const unusedPriorKnowledge = course.priorKnowledge.filter(priorKnowledge => !priorKnowledgeSet.has(priorKnowledge))
				expect(unusedPriorKnowledge).toHaveLength(0)
			})

			it('has no superfluous starting points', () => {
				const { skillsSet } = getSkillSets(course.goals, course.priorKnowledge)
				const desiredStartingPoints = [...skillsSet].filter(skillId => skills[skillId].prerequisites.length === 0)
				const superfluousStartingPoints = course.startingPoints.filter(skillId => !desiredStartingPoints.includes(skillId))
				expect(superfluousStartingPoints).toHaveLength(0)
			})

			it('has no missing prior knowledge or starting points', () => {
				const { skillsSet } = getSkillSets(course.goals, course.priorKnowledge)
				const desiredStartingPoints = [...skillsSet].filter(skillId => skills[skillId].prerequisites.length === 0)
				const basicSkillsNotDefinedAsStartingPoint = desiredStartingPoints.filter(skillId => !course.startingPoints.includes(skillId))
				expect(basicSkillsNotDefinedAsStartingPoint).toHaveLength(0)
			})

			// Check blocks: any missing or superfluous skills there?

			const getSkillsSetForBlocks = () => {
				const skillsSetForBlocks = new Set() // Define a skills set that we will fill up.
				course.blocks.forEach(block => {
					getSkillSets(block.goals, course.priorKnowledge, skillsSetForBlocks)
				})
				return skillsSetForBlocks
			}
			it('has no blocks with superfluous goals', () => {
				expect(getSkillsSetForBlocks).not.toThrow()
			})

			it('has no blocks with goals outside of the course content', () => {
				const { skillsSet } = getSkillSets(course.goals, course.priorKnowledge)
				const blockGoals = course.blocks.map(block => block.goals).flat()
				const blockGoalsOutsideOfCourse = blockGoals.filter(goal => !skillsSet.has(goal))
				expect(blockGoalsOutsideOfCourse).toHaveLength(0)
			})

			it('has blocks that cover all the course goals', () => {
				const blockGoals = course.blocks.map(block => block.goals).flat()
				const goalsNotCoveredByBlocks = course.goals.filter(goal => !blockGoals.includes(goal))
				expect(goalsNotCoveredByBlocks).toHaveLength(0)
			})
		})
	})
})

// getSkillSets retrieves all the skills for a course and throws an error when something fishy is going on. Note that this is different from the functions in ui/edu/course/util.js because that function tries to work around failures, instead of throwing as many of them as possible. It returns { skillsSet, priorKnowledgeSet } where the first contains all skills in the course and the second contains all found prior knowledge skills.
function getSkillSets(goals, priorKnowledge, skillsSet = new Set()) {
	const priorKnowledgeSet = new Set()
	goals.forEach(goal => {
		if (skillsSet.has(goal))
			throw new Error(`Superfluous goal: the goal ${goal} appears to be unnecessary.`)
		addToSkillSets(goal, goals, priorKnowledge, skillsSet, priorKnowledgeSet)
	})
	return { skillsSet, priorKnowledgeSet }
}

function addToSkillSets(skillId, goals, priorKnowledge, skillsSet, priorKnowledgeSet) {
	// If we already added this skill, don't iterate further above it. Do throw an error if this is a goal, since then it's unnecessary.
	if (skillsSet.has(skillId)) {
		if (goals.includes(skillId))
			throw new Error(`Superfluous goal: the goal ${skillId} appears to be unnecessary.`)
		return
	}

	// If this skill is prior knowledge, we don't need to learn it. Do add it to the prior knowledge set so we can check the prior knowledge.
	if (priorKnowledge.includes(skillId)) {
		priorKnowledgeSet.add(skillId)
		return
	}

	// Recursively add prerequisites.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Invalid skill: could not find "${skillId}" when processing course data.`)
	if (skill.prerequisites)
		skill.prerequisites.forEach(prerequisiteId => addToSkillSets(prerequisiteId, goals, priorKnowledge, skillsSet, priorKnowledgeSet))

	// Add this skill to the sets.
	skillsSet.add(skillId)
}