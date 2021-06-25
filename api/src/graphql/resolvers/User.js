const { checkSkillIds } = require('../util/Skill')
const { getUser, getAllUsers } = require('../util/User')
const { AuthenticationError } = require('apollo-server-express')

const CURRENT_PRIVACY_POLICY_VERSION = 1;

const resolvers = {
	User: {
		skills: async (user, { ids }) => {
			if (!ids)
				return await user.getSkills()
			checkSkillIds(ids)
			return await user.getSkills({ where: { skillId: ids } })
		},
		privacyPolicyConsent: (user) => {
			return {
				version: user.privacyPolicyAcceptedVersion,
				acceptedAt: user.privacyPolicyAcceptedAt,
				isLatestVersion: user.privacyPolicyAcceptedVersion === CURRENT_PRIVACY_POLICY_VERSION,
			}
		}
	},

	Mutation: {
		acceptLatestPrivacyPolicy: async (_source, _args, { getUser }) => {
			const user = await getUser()
			if (!user) {
				throw new AuthenticationError('Not logged in')
			}
			// Only run update if we are behind
			if (!user.privacyPolicyAcceptedVersion || user.privacyPolicyAcceptedVersion < CURRENT_PRIVACY_POLICY_VERSION) {
				await user.update({
					privacyPolicyAcceptedVersion: CURRENT_PRIVACY_POLICY_VERSION,
					privacyPolicyAcceptedAt: new Date(),
				})
			}
			return {
				version: user.privacyPolicyAcceptedVersion,
				acceptedAt: user.privacyPolicyAcceptedAt,
				isLatestVersion: true,
			}
		},

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
