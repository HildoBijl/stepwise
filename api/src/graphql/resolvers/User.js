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
	User: {
		async __resolveType(user, { loaders, isLoggedIn, user: currentUser, isAdmin }) {
			// Not logged in? Never access any user data.
			if (!isLoggedIn)
				return null

			// Is this you? You get all data. Admins do as well.
			if (currentUser.id === user.id || isAdmin)
				return 'UserFull'

			// If the current user teaches a course where the given user is a student, allow private data.
			const hasStudentInCourse = await loaders.hasStudentInCourse.load(`${currentUser.id}:${user.id}`)
			if (hasStudentInCourse)
				return 'UserPrivate'

			// Just a regular user: only give public info.
			return 'UserPublic'
		}
	},
	UserPublic: userPublicResolvers,
	UserPrivate: userPrivateResolvers,
	UserFull: userFullResolvers,

	Mutation: {
		setLanguage: async (_source, { language }, { ensureLoggedIn, user }) => {
			ensureLoggedIn()

			// Check the received language.
			if (!languages.includes(language))
				throw new Error(`Invalid language setting: the language "${language}" is not in the list of supported languages.`)

			// Save the received language.
			await user.update({ language })
			return user
		},

		acceptLatestPrivacyPolicy: async (_source, _args, { ensureLoggedIn, user }) => {
			ensureLoggedIn()

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

		shutdownAccount: async (_source, { confirmEmail }, { ensureLoggedIn, user }) => {
			ensureLoggedIn()

			// Get the user and verify the given email address.
			if (user.email !== confirmEmail)
				throw new UserInputError('User shutdown denied: the confirmation email does not match.')

			// Destroy the user. The database is configured to cascade the deletion, so this will also delete all associated user data.
			await user.destroy()
			return user.id
		},
	},

	Query: {
		me: async (_source, _args, { user }) => user,

		user: async (_source, { userId }, { db, ensureAdmin }) => {
			ensureAdmin()
			return await getUser(db, userId)
		},

		allUsers: async (_source, _args, { db, ensureAdmin }) => {
			ensureAdmin()
			return await getAllUsers(db)
		},
	},
}

module.exports = resolvers
