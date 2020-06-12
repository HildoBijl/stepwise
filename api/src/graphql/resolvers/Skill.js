const skills = require('step-wise/edu/skills')
const { checkSkillIds } = require('../util/Skill')

const commonResolvers = {
	id: userSkill => userSkill.skillId,
	name: userSkill => skills[userSkill.skillId].name,
}

const resolvers = {
	Skill: {
		...commonResolvers,
		exercises: async (userSkill, _args, { db }) => await db.ExerciseSample.findAll({ where: { userSkillId: userSkill.id } }),
		currentExercise: async (userSkill, _args, { db }) => await db.ExerciseSample.findOne({ where: { userSkillId: userSkill.id, active: true, } })
	},

	SkillWithoutExercises: {
		...commonResolvers,
	},

	Query: {
		skill: async (_source, { id }, { db, getUser }) => {
			// Check if there is a user.
			const user = await getUser()
			if (!user)
				throw new Error(`Cannot read skill "${id}": no user is logged in.`)

			// Find the corresponding skill.
			checkSkillIds([id])
			return await db.UserSkill.findOne({ where: { userId: user.id, skillId: id } })
		},
		mySkills: async (_source, { ids }, { db, getUser }) => {
			// Check if there is a user.
			const user = await getUser()
			if (!user)
				throw new Error(`Cannot read skill "${id}": no user is logged in.`)

			// Depending on whether ids have been provided, find the corresponding skills.
			if (!ids)
				return await db.UserSkill.findAll({ where: { userId: user.id } })
			checkSkillIds(ids)
			return await db.UserSkill.findAll({ where: { userId: user.id, skillId: ids } })
		},
	},
}

module.exports = resolvers
