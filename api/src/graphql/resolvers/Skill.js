const { AuthenticationError } = require('apollo-server-express')

const { ensureSkillId, ensureSkillIds, exercises: allExercises } = require('step-wise/eduTools')

const { getSubscription } = require('../util/subscriptions')
const { getUser } = require('../util/User')
const { events, getUserSkill, getUserSkills } = require('../util/Skill')

const skillWithoutExercisesResolvers = {}
const skillWithExercisesResolvers = {
	...skillWithoutExercisesResolvers,
	exercises: (skill, _args, { loaders }) => loaders.exercisesForSkill.load(skill.id),
	activeExercise: async (skill, _args, { loaders }) => {
		const skillExercises = await loaders.exercisesForSkill.load(skill.id)
		return skillExercises.find(exercise => exercise.active && allExercises[exercise.exerciseId]) || null // Find the exercise that is active and whose exercise script still exists.
	},
}

const resolvers = {
	SkillWithoutExercises: skillWithoutExercisesResolvers,
	SkillWithExercises: skillWithExercisesResolvers,
	Skill: {
		async __resolveType(skill) {
			// Use the flag set up earlier.
			return skill.allowExercises ? 'SkillWithExercises' : 'SkillWithoutExercises'
		}
	},

	Query: {
		skill: async (_source, { skillId, userId }, { db, loaders, ensureLoggedIn, userId: currentUserId, isAdmin }) => {
			ensureLoggedIn()
			skillId = ensureSkillId(skillId)
			userId = userId ?? currentUserId // On undefined userId, take the current user.

			// If the given userId is not the current user, verify that the user exists.
			if (userId !== currentUserId)
				await getUser(db, userId) // Will throw if not exists.

			// Instantly allow the request if it's for the current user, or if the current user is an admin.
			if (userId === currentUserId || isAdmin) {
				const skill = await getUserSkill(db, userId, skillId)
				if (skill)
					skill.allowExercises = true
				return skill
			}

			// It's a request for someone else. Check if this is allowed.
			const { withExercises, withoutExercises } = await loaders.permittedSkillsForStudent.load(userId)
			if (!withoutExercises.includes(skillId))
				throw new AuthenticationError(`Invalid skill request: the current user is not allowed to access skill "${skillId}" of the user with ID "${userId}".`)

			// It's allowed. Load the skill.
			const skill = await getUserSkill(db, userId, skillId)
			skill.allowExercises = withExercises.includes(skillId)
			return skill
		},
		skills: async (_source, { skillIds }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			if (skillIds)
				skillIds = ensureSkillIds(skillIds)
			return await getUserSkills(db, userId, skillIds)
		},
	},

	Subscription: {
		...getSubscription('skillsUpdate', [events.skillsUpdated], ({ updatedSkills, userId }, _args, { userId: currentUserId }) => {
			// Only pass on for the current user.
			if (userId === currentUserId)
				return updatedSkills
		}),
	},
}

module.exports = resolvers
