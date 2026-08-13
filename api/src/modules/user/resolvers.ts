import { UserInputError } from 'apollo-server-express'
import { currentPrivacyPolicyVersion, languages } from '@step-wise/settings'

import type { UserRecord } from './model'
import { getAllUsers, getUser, type UserDatabase } from './service'

interface UserContext {
	db: UserDatabase
	user: UserRecord | null
	isAdmin: boolean
	loaders: any
	ensureLoggedIn(): void
	ensureAdmin(): void
}

const privacyPolicyConsent = (user: UserRecord) => ({
	version: user.privacyPolicyAcceptedVersion,
	acceptedAt: user.privacyPolicyAcceptedAt,
	isLatestVersion: user.privacyPolicyAcceptedVersion === currentPrivacyPolicyVersion,
})

export const userResolvers = {
	UserPublic: {},
	UserPrivate: {},
	UserFull: { privacyPolicyConsent },
	User: {
		async __resolveType(user: UserRecord, context: UserContext) {
			if (!context.user) return 'UserPublic'
			if (context.user.id === user.id || context.isAdmin) return 'UserFull'
			const coursesWithStudent = await context.loaders.coursesWithStudent.load(user.id)
			return coursesWithStudent.length > 0 ? 'UserPrivate' : 'UserPublic'
		},
	},
	Mutation: {
		setLanguage: async (_source: unknown, { language }: { language: string }, { ensureLoggedIn, user }: UserContext) => {
			ensureLoggedIn()
			if (!(languages as readonly string[]).includes(language)) throw new Error(`Invalid language setting: the language "${language}" is not in the list of supported languages.`)
			await user!.update({ language })
			return user
		},
		acceptLatestPrivacyPolicy: async (_source: unknown, _args: unknown, { ensureLoggedIn, user }: UserContext) => {
			ensureLoggedIn()
			if (!user!.privacyPolicyAcceptedVersion || user!.privacyPolicyAcceptedVersion < currentPrivacyPolicyVersion)
				await user!.update({ privacyPolicyAcceptedVersion: currentPrivacyPolicyVersion, privacyPolicyAcceptedAt: new Date() })
			return { ...privacyPolicyConsent(user!), isLatestVersion: true }
		},
		shutdownAccount: async (_source: unknown, { confirmEmail }: { confirmEmail: string }, { ensureLoggedIn, user }: UserContext) => {
			ensureLoggedIn()
			if (user!.email !== confirmEmail) throw new UserInputError('User shutdown denied: the confirmation email does not match.')
			await user!.destroy()
			return user!.id
		},
	},
	Query: {
		me: async (_source: unknown, _args: unknown, { user }: UserContext) => user,
		user: async (_source: unknown, { userId }: { userId: string }, { db, ensureLoggedIn }: UserContext) => {
			ensureLoggedIn()
			return getUser(db, userId)
		},
		allUsers: async (_source: unknown, _args: unknown, { db, ensureAdmin }: UserContext) => {
			ensureAdmin()
			return getAllUsers(db)
		},
	},
}
