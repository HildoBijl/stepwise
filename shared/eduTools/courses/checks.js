const { hasDuplicates } = require('../../util')
const { objToSetup } = require('../../skillTracking')

const { ensureSkillIds } = require('../skills')

const { processCourse, getSkillsBetween } = require('./util')

// ensureValidCourseEndpoints takes a course goals and starting points and ensures that it's all in order. If not, an error is thrown. It returns a course object with all the respective lists from processCourse in it.
function ensureValidCourseEndpoints(goals, startingPoints) {
	// Ensure that the parameters are valid skill lists without duplicates.
	goals = ensureSkillIds(goals)
	startingPoints = ensureSkillIds(startingPoints)
	if (hasDuplicates(goals))
		throw new Error(`Invalid course goals: there are duplicates in the list.`)
	if (hasDuplicates(startingPoints))
		throw new Error(`Invalid course starting points: there are duplicates in the list.`)

	// Process the course based on the given skill lists. Check the outcome.
	const course = processCourse(goals, startingPoints)
	const { superfluousGoals, missingStartingPoints, externalStartingPoints, superfluousStartingPoints } = course
	if (externalStartingPoints.length > 0)
		throw new Error(`Invalid course starting points: there are starting points that are not required for any of the goals. Check out ${JSON.stringify(externalStartingPoints)}.`)
	if (missingStartingPoints.length > 0)
		throw new Error(`Invalid course starting points: there are missing starting points. Consider adding ${JSON.stringify(missingStartingPoints)} or otherwise prerequisites/follow-ups of them.`)
	if (superfluousStartingPoints.length > 0)
		throw new Error(`Invalid course starting points: there are superfluous starting points. You do not need to add ${JSON.stringify(superfluousStartingPoints)}.`)
	if (superfluousGoals.length > 0)
		throw new Error(`Invalid course goals: there are superfluous course goals. You do not need to add ${JSON.stringify(superfluousGoals)}.`)

	// All is fine. Return the course.
	return course
}
module.exports.ensureValidCourseEndpoints = ensureValidCourseEndpoints

// ensureValidCourseSetup takes a course (goals and endpoints) and a corresponding set-up and ensures that the set-up is valid for that course. If not, an error is thrown. This function assumes that the course itself has been checked for validity already.
function ensureValidCourseSetup(course, setup, allowMissing = false) {
	// If no set-up is allowed, check for this.
	if (allowMissing && !setup)
		return

	// Interpret the set-up and check if its skills are all part of the course.
	const functionalSetup = objToSetup(setup)
	const setupSkills = [...functionalSetup.getSkillSet()]
	if (setupSkills.some(skillId => !course.contents.includes(skillId)))
		throw new Error(`Invalid course set-up: the skills in the set-up of the course ${JSON.stringify(setupSkills)} are not all part of the course. Make sure that the set-up only references skills that are actually taught.`)
}
module.exports.ensureValidCourseSetup = ensureValidCourseSetup

// ensureValidCourseBlocks takes a course (goals and endpoints) and a corresponding set of blocks and ensures that the blocks are valid for that course. If not, an error is thrown. This function assumes that the course itself has been checked for validity already.
function ensureValidCourseBlocks(course, blocks) {
	let blockGoalsSoFar = [], contentsSoFar = []
	blocks.forEach(({ goals }) => {
		goals = ensureSkillIds(goals)

		// Ensure that all block goals are part of the course.
		if (goals.some(goalId => !course.contents.includes(goalId)))
			throw new Error(`Invalid block goals: the block with goals ${JSON.stringify(goals)} contains contents that are not part of the course.`)

		// Ensure that the block goals are not already treated earlier in the course.
		if (goals.some(goalId => contentsSoFar.includes(goalId)))
			throw new Error(`Invalid block goals: the block with goals ${JSON.stringify(goals)} has contents that are already treated in an earlier block.`)

		// Ensure that the block is not empty.
		if (goals.length === 0)
			throw new Error(`Invalid block goals: an empty block without any goals is not allowed.`)

		blockGoalsSoFar = [...blockGoalsSoFar, ...goals]
		contentsSoFar = getSkillsBetween(blockGoalsSoFar, course.priorKnowledge)
	})

	// Ensure that all blocks together cover the course.
	const uncoveredSkills = course.contents.filter(skillId => !contentsSoFar.includes(skillId))
	if (uncoveredSkills.length > 0)
		throw new Error(`Invalid block goals: the goals together should cover all skills in the course, but there are various skills that are now not treated. These are ${JSON.stringify(uncoveredSkills)}.`)
}
module.exports.ensureValidCourseBlocks = ensureValidCourseBlocks
