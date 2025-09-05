const { exercises } = require('step-wise/eduTools')

const { getSubscription } = require('../util/subscriptions')
const { events, getUserSkill, getUserSkills } = require('../util/Skill')

const skillLevelResolvers = {}
const skillResolvers = {
	...skillLevelResolvers,
	currentExercise: skill => skill.exercises.find(exercise => exercise.active && exercises[exercise.exerciseId]), // Find the exercise that is active and whose exercise script still exists.
}

const resolvers = {
	SkillLevel: skillLevelResolvers,
	Skill: skillResolvers,

	Query: {
		skill: async (_source, { skillId, userId }, { db, ensureLoggedIn, ensureAdmin, userId: currentUserId }) => {
			// If no ID is given, the request is for the current user.
			if (!userId) {
				ensureLoggedIn()
				return await getUserSkill(currentUserId, skillId, db)
			}

			// If an ID is given, it's a request for someone else. Only admins are allowed to do so for now.
			if (userId) {
				ensureAdmin()
				return await getUserSkill(userId, skillId, db)
			}
		},
		skills: async (_source, { skillIds }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			return await getUserSkills(userId, skillIds, db)
		},
	},

	Subscription: {
		...getSubscription('skillsUpdate', [events.skillsUpdated], ({ updatedSkills, userId: skillsUserId }, _args, { userId }) => {
			// Only pass on for the current user.
			if (userId === skillsUserId)
				return updatedSkills
		}),
	},
}

module.exports = resolvers
