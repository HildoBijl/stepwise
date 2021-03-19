const { checkSkillIds } = require('../util/Skill')
const { getAllUsers } = require('../util/User')

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

		allUsers: async (_source, _args, { db, ensureAdmin }) => {
			await ensureAdmin()
			return await getAllUsers(db)
		},
	},
}

module.exports = resolvers
