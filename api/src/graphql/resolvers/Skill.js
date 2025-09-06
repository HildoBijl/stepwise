const { ensureSkillId, ensureSkillIds, exercises } = require('step-wise/eduTools')

const { getSubscription } = require('../util/subscriptions')
const { events, getUserSkill, getUserSkills } = require('../util/Skill')

const skillWithoutExercisesResolvers = {}
const skillWithExercisesResolvers = {
	...skillWithoutExercisesResolvers,
	exercises: (skill, _args, { loaders }) => loaders.exercisesForSkill.load(skill.id),
	currentExercise: async (skill, _args, { loaders }) => {
		const skillExercises = await loaders.exercisesForSkill.load(skill.id)
		return skillExercises.find(exercise => exercise.active && exercises[exercise.exerciseId]) || null // Find the exercise that is active and whose exercise script still exists.
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
			ensureSkillId(skillId)

			// If this is a request for the user itself (no ID given, or ID equal to current userId) then allow it. Also instantly allow for admins.
			if (!userId || userId === currentUserId || isAdmin) {
				const skill = await getUserSkill(db, currentUserId, skillId)
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
			ensureSkillIds(skillIds)
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
