const { checkSkillIds } = require('../util/Skill')

const resolvers = {
	User: {
		skills: async (user, { ids }, { db }) => {
			if (!ids)
				return await db.UserSkill.findAll({ where: { userId: user.id } })
			checkSkillIds(ids)
			return await db.UserSkill.findAll({ where: { userId: user.id, skillId: { [Op.or]: ids } } })
		},
	},

	Query: {
		me: async (_source, _args, { getUser }) => {
			return await getUser()
		},
	},
}

module.exports = resolvers
