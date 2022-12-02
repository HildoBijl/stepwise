const { UserInputError } = require('apollo-server-express')

const { checkSkillIds } = require('../util/Skill')
const { getUser, getAllUsers } = require('../util/User')

const CURRENT_PRIVACY_POLICY_VERSION = 1

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
		acceptLatestPrivacyPolicy: async (_source, _args, { getCurrentUser }) => {
			const user = await getCurrentUser()
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

		shutdownAccount: async (_source, { confirmEmail }, { getCurrentUser }) => {
			const user = await getCurrentUser()
			if (user.email !== confirmEmail) {
				throw new UserInputError('The confirmation email does not match.')
			}
			// The database is configured to cascade the deletion, so this
			// will also delete all associated user data.
			await user.destroy()
			return user.id
		},
	},

	Query: {
		me: async (_source, _args, { getCurrentUser }) => {
			try {
				return await getCurrentUser()
			} catch (err) {
				return null
			}
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
