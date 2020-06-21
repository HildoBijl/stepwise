const { checkSkillIds } = require('../util/Skill')

const resolvers = {
	User: {
		skills: async (user, { ids }) => {
			if (!ids)
				return await user.getSkills()
			checkSkillIds(ids)
			return await user.getSkills({ where: { skillId: ids } })
		},
	},

	Query: {
		me: async (_source, _args, { getUser }) => {
			return await getUser()
		},
	},
}

module.exports = resolvers
