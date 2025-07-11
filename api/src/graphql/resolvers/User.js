const { UserInputError } = require('apollo-server-express')

const { languages, currentPrivacyPolicyVersion } = require('step-wise/settings')
const { ensureSkillIds } = require('step-wise/eduTools')

const { getUser, getAllUsers } = require('../util/User')

const userPublicResolvers = {}
const userPrivateResolvers = {
	...userPublicResolvers,
	skills: async (user, { ids }) => {
		if (!ids)
			return await user.getSkills()
		ids = ensureSkillIds(ids)
		return await user.getSkills({ where: { skillId: ids } })
	},
}
const userFullResolvers = {
	...userPrivateResolvers,
	privacyPolicyConsent: (user) => {
		return {
			version: user.privacyPolicyAcceptedVersion,
			acceptedAt: user.privacyPolicyAcceptedAt,
			isLatestVersion: user.privacyPolicyAcceptedVersion === currentPrivacyPolicyVersion,
		}
	},
}

const resolvers = {
	UserPublic: userPublicResolvers,
	UserPrivate: userPrivateResolvers,
	UserFull: userFullResolvers,

	Mutation: {
		setLanguage: async (_source, { language }, { getCurrentUser }) => {
			// Check the received language.
			if (!languages.includes(language))
				throw new Error(`Invalid language setting: the language "${language}" is not in the list of supported languages.`)

			// Save the received language.
			const user = await getCurrentUser()
			await user.update({ language })
			return user
		},

		acceptLatestPrivacyPolicy: async (_source, _args, { getCurrentUser }) => {
			const user = await getCurrentUser()

			// Only run update if we are behind.
			if (!user.privacyPolicyAcceptedVersion || user.privacyPolicyAcceptedVersion < currentPrivacyPolicyVersion) {
				await user.update({
					privacyPolicyAcceptedVersion: currentPrivacyPolicyVersion,
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
			// Get the user and verify the given email address.
			const user = await getCurrentUser()
			if (user.email !== confirmEmail)
				throw new UserInputError('User shutdown denied: the confirmation email does not match.')

			// Destroy the user. The database is configured to cascade the deletion, so this will also delete all associated user data.
			await user.destroy()
			return user.id
		},
	},

	Query: {
		me: async (_source, _args, { getCurrentUser }) => {
			try {
				return await getCurrentUser()
			} catch (error) {
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
