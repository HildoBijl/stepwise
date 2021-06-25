const { checkSkillIds } = require('../util/Skill')
const { getUser, getAllUsers } = require('../util/User')
const { AuthenticationError } = require('apollo-server-express')

const resolvers = {
	User: {
		skills: async (user, { ids }) => {
			if (!ids)
				return await user.getSkills()
			checkSkillIds(ids)
			return await user.getSkills({ where: { skillId: ids } })
		},
	},

	Mutation: {
		shutdownAccount: async (_source, { confirmEmail }, { getUser }) => {
			const user = await getUser()
			if (!user) {
				throw new AuthenticationError('Not logged in')
			}
			if (user.email !== confirmEmail) {
				throw new Error('Email (for confirmation) does not match')
			}
			// The database is configured to cascade the deletion, so this
			// will also delete all associated user data.
			await user.destroy()
			return user.id
		},
	},

	Query: {
		me: async (_source, _args, { getUser }) => {
			return await getUser()
		},

		user: async (_source, { userId }, { db, ensureAdmin }) => {
			await ensureAdmin()
			return await getUser(db, userId)
		},

		allUsers: async (_source, _args, { db, ensureAdmin }) => {
			await ensureAdmin()
			return await getAllUsers(db)
		},
	},
}

module.exports = resolvers
