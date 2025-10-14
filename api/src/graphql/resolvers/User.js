const { UserInputError } = require('apollo-server-express')

const { languages, currentPrivacyPolicyVersion } = require('step-wise/settings')
const { ensureSkillIds } = require('step-wise/eduTools')

const { getUser, getAllUsers } = require('../util/User')

const userPublicResolvers = {}
const userPrivateResolvers = {
	...userPublicResolvers,
	skills: async (user, { ids: skillIds }, { loaders, userId, isAdmin }) => {
		// Ensure the input (if given) is a valid array.
		if (skillIds)
			skillIds = ensureSkillIds(skillIds)

		// If all skills should be loaded, then do so.
		const mayLoadAll = user.id === userId || isAdmin
		if (!skillIds && mayLoadAll) {
			const skills = await loaders.allSkillsForUser.load(user.id)
			skills.forEach(skill => { skill.allowExercises = true })
			return skills
		}

		// If the user requested skills yet may load all skills, load the requested skills.
		if (mayLoadAll) {
			let skills = await loaders.skillForUser.loadMany(skillIds.map(skillId => ({ userId: user.id, skillId })))
			skills = skills.filter(Boolean)
			skills.forEach(skill => { skill.allowExercises = true })
			return skills
		}

		// The user has limited access. Apply this and only load those skills that may be loaded.
		const { withExercises, withoutExercises } = await loaders.permittedSkillsForStudent.load(user.id)
		skillIds = skillIds ? skillIds.filter(skillId => withoutExercises.includes(skillId)) : withoutExercises
		let skills = await loaders.skillForUser.loadMany(skillIds.map(skillId => ({ userId: user.id, skillId })))
		skills = skills.filter(Boolean)

		// Add a flag to each skill, whether exercises are allowed to be loaded. (We already have this data now anyway.) Then return the result (without null values).
		skills.forEach(skill => { skill.allowExercises = withExercises.includes(skill.skillId) })
		return skills
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
	User: {
		async __resolveType(user, { loaders, user: currentUser, isAdmin }) {
			// Does the user not exist? (Should never happen.) Then it's public.
			if (!currentUser)
				return 'UserPublic'

			// Is this you? You get all data. Admins do as well.
			if (currentUser.id === user.id || isAdmin)
				return 'UserFull'

			// If the current user teaches a course where the given user is a student, allow private data.
			const coursesWithStudent = await loaders.coursesWithStudent.load(user.id)
			if (coursesWithStudent.length > 0)
				return 'UserPrivate'

			// Just a regular user: only give public info.
			return 'UserPublic'
		}
	},

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

		user: async (_source, { userId }, { db, ensureLoggedIn }) => {
			ensureLoggedIn()
			return await getUser(db, userId)
		},

		allUsers: async (_source, _args, { db, ensureAdmin }) => {
			ensureAdmin()
			return await getAllUsers(db)
		},
	},
}

module.exports = resolvers
