const skills = require('step-wise/edu/skills')
const { checkSkillIds } = require('../util/Skill')

const resolvers = {
	Skill: {
		id: userSkill => userSkill.skillId,
		name: userSkill => skills[userSkill.skillId].name,
		exercises: async (userSkill, _args, { dataSources }) => await dataSources.database.ExerciseSample.findAll({ where: { userSkillId: userSkill.id } }),
		currentExercise: async (userSkill, _args, { dataSources }) => await dataSources.database.ExerciseSample.findByPk(userSkill.currentExerciseId),
	},

	Query: {
		mySkills: async (_source, { ids }, { dataSources, getPrincipal }) => {
			const user = getPrincipal()
			if (!user)
				return null
			if (!ids)
				return await dataSources.database.UserSkill.findAll({ where: { userId: user.id } })
			checkSkillIds(ids)
			return await dataSources.database.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},
}

module.exports = resolvers
