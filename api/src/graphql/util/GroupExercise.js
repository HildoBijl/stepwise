const { UserInputError, ForbiddenError } = require('apollo-server-express')

const { getLastEvent, getExerciseProgress } = require('./Exercise')

// These functions are the same as for the regular exercises.
module.exports.getLastGroupEvent = getLastEvent
module.exports.getGroupExerciseProgress = getExerciseProgress

// verifyGroupAccess checks if the group exists and has a member with the given userId.
function verifyGroupAccess(group, userId) {
	if (!group)
		throw new UserInputError(`No group with the given code exists.`)
	const member = group.members && group.members.find(member => member.id === userId)
	if (!member)
		throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is not a member.`)
	if (!member.groupMembership.active)
		throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is currently not active in that group.`)
}
module.exports.verifyGroupAccess = verifyGroupAccess

// getGroupWithActiveExercises takes a group code and extracts the group with all active exercises (from all skills) from the database.
async function getGroupWithActiveExercises(code, db) {
	code = code.toUpperCase()
	return await db.Group.findOne({
		where: { code },
		include: [{
			association: 'members',
		}, {
			association: 'exercises',
			where: { active: true },
			required: false,
			include: {
				association: 'events',
				required: false,
				include: {
					association: 'actions',
					required: false,
				},
			},
		}],
	})
}
module.exports.getGroupWithActiveExercises = getGroupWithActiveExercises

// getGroupWithActiveSkillExercise takes a group code and a skillId and returns the group together with only the active exercise for that skill.
async function getGroupWithActiveSkillExercise(code, skillId, db) {
	code = code.toUpperCase()
	return await db.Group.findOne({
		where: { code },
		include: [{
			association: 'members',
		}, {
			association: 'exercises',
			where: { skillId, active: true },
			required: false,
			include: {
				association: 'events',
				required: false,
				include: {
					association: 'actions',
					required: false,
				},
			},
		}],
	})
}
module.exports.getGroupWithActiveSkillExercise = getGroupWithActiveSkillExercise

// processGroupExercises takes a group with both its members and all the exercises. It then walks through the exercises and, for every action inside every action, couples the right member data from the group to it.
function processGroupExercises(group) {
	group.exercises = group.exercises.map(exercise => processExercise(exercise, group))
	return group
}
module.exports.processGroupExercises = processGroupExercises

// processExercise takes a group (with member data) and an exercise and process the exercise to make sure all related member data is inside the exercise.
function processExercise(exercise, group) {
	// ToDo
	return exercise
}
module.exports.processExercise = processExercise