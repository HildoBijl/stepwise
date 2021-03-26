const skills = require('step-wise/edu/skills')
const { getUserSkill, getUserSkills } = require('../util/Skill')

const commonResolvers = {} // None at the moment.

const resolvers = {
	Skill: {
		...commonResolvers,
		currentExercise: skill => skill.exercises.find(exercise => exercise.active),
	},

	SkillWithoutExercises: {
		...commonResolvers,
	},

	Query: {
		skill: async (_source, { skillId, userId }, { db, getUserIdOrThrow, ensureAdmin }) => {
			// If no ID is given, the request is for the current user.
			if (!userId)
			return await getUserSkill(getUserIdOrThrow(), skillId, db)

			// If an ID is given, it's a request for someone else. Only admins are allowed to do so for now.
			if (userId) {
				await ensureAdmin()
				return await getUserSkill(userId, skillId, db)
			}
		},
		skills: async (_source, { skillIds }, { db, getUserIdOrThrow }) => {
			return await getUserSkills(getUserIdOrThrow(), skillIds, db)
		},
	},
}

module.exports = resolvers