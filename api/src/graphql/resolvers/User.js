const { checkSkillIds } = require('../util/Skill')

const resolvers = {
	User: {
		skills: async (user, { ids }, { dataSources }) => {
			if (!ids)
				return await dataSources.database.UserSkill.findAll({ where: { userId: user.id } })
			checkSkillIds(ids)
			return await dataSources.database.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},

	Query: {
		me: async (_source, _args, { dataSources, getPrincipal }) => {
			const user = getPrincipal()
			if (!user)
				return null
			return await dataSources.database.User.findByPk(user.id)
		},
	},
}

module.exports = resolvers
