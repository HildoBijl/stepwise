import { UserInputError } from 'apollo-server-express'
import { currentPrivacyPolicyVersion, languages } from '@step-wise/settings'

import type { UserRecord } from './model.ts'
import { type UserDatabase, getAllUsers, getUser } from './service.ts'

export interface UserContext {
	db: UserDatabase
	user: UserRecord | null
	isAdmin: boolean
	loaders: any
	ensureLoggedIn(): void
	ensureAdmin(): void
}

export type UserPrivateAccessRule = (user: UserRecord, context: UserContext) => boolean | Promise<boolean>

function privacyPolicyConsent(user: UserRecord) {
	return {
		version: user.privacyPolicyAcceptedVersion,
		acceptedAt: user.privacyPolicyAcceptedAt,
		isLatestVersion: user.privacyPolicyAcceptedVersion === currentPrivacyPolicyVersion,
	}
}

const userResolvers = {
	UserPublic: {},
	UserPrivate: {},
	UserFull: { privacyPolicyConsent },

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
	
	Mutation: {
		setLanguage: async (_source: unknown, { language }: { language: string }, { ensureLoggedIn, user }: UserContext) => {
			ensureLoggedIn()
			if (!(languages as readonly string[]).includes(language)) throw new Error(`Invalid language setting: the language "${language}" is not in the list of supported languages.`)
			await user!.update({ language })
			return user
		},
		acceptLatestPrivacyPolicy: async (_source: unknown, _args: unknown, { ensureLoggedIn, user }: UserContext) => {
			ensureLoggedIn()
			if (!user!.privacyPolicyAcceptedVersion || user!.privacyPolicyAcceptedVersion < currentPrivacyPolicyVersion) await user!.update({ privacyPolicyAcceptedVersion: currentPrivacyPolicyVersion, privacyPolicyAcceptedAt: new Date() })
			return { ...privacyPolicyConsent(user!), isLatestVersion: true }
		},
		shutdownAccount: async (_source: unknown, { confirmEmail }: { confirmEmail: string }, { ensureLoggedIn, user }: UserContext) => {
			ensureLoggedIn()
			if (user!.email !== confirmEmail) throw new UserInputError('User shutdown denied: the confirmation email does not match.')
			await user!.destroy()
			return user!.id
		},
	},
}

export function createUserResolvers(privateAccessRules: UserPrivateAccessRule[] = []) {
	return {
		...userResolvers,
		User: {
			async __resolveType(user: UserRecord, context: UserContext) {
				if (!context.user) return 'UserPublic'
				if (context.user.id === user.id || context.isAdmin) return 'UserFull'
				for (const rule of privateAccessRules)
					if (await rule(user, context)) return 'UserPrivate'
				return 'UserPublic'
			},
		},
	}
}
