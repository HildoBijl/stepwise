const { Op } = require('sequelize')

const skills = require('step-wise/edu/skills')
const { checkSkillIds } = require('../util/Skill')

const resolvers = {
	Skill: {
		id: userSkill => userSkill.skillId,
		name: userSkill => skills[userSkill.skillId].name,
		exercises: async (userSkill, _args, { db }) => await db.ExerciseSample.findAll({ where: { userSkillId: userSkill.id } }),
		currentExercise: async (userSkill, _args, { db }) => await db.ExerciseSample.findByPk(userSkill.currentExerciseId),
	},

	Query: {
		mySkills: async (_source, { ids }, { db, getUser }) => {
			const user = await getUser()
			if (!user)
				return null
			if (!ids)
				return await db.UserSkill.findAll({ where: { userId: user.id } })
			checkSkillIds(ids)
			return await db.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},
}

module.exports = resolvers
