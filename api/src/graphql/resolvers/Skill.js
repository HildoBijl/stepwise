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
		skill: async (_source, { skillId, userId }, { db, getCurrentUserId, ensureAdmin }) => {
			// If no ID is given, the request is for the current user.
			if (!userId)
				return await getUserSkill(getCurrentUserId(), skillId, db)

			// If an ID is given, it's a request for someone else. Only admins are allowed to do so for now.
			if (userId) {
				await ensureAdmin()
				return await getUserSkill(userId, skillId, db)
			}
		},
		skills: async (_source, { skillIds }, { db, getCurrentUserId }) => {
			return await getUserSkills(getCurrentUserId(), skillIds, db)
		},
	},
}

module.exports = resolvers
