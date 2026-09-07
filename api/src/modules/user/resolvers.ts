import { currentPrivacyPolicyVersion, languages } from '@step-wise/settings'

import { InvalidInputError } from '../../errors.ts'

import type { ApiContext } from '../types.ts'

import type { UserRecord } from './models.ts'
import { getAllUsers, getUser } from './service.ts'

export type UserContext = Pick<ApiContext, 'db' | 'user' | 'isAdmin' | 'loaders' | 'ensureSignedIn' | 'ensureAdmin'>

export type UserSharedDataAccessRule = (user: UserRecord, context: UserContext) => boolean | Promise<boolean>

function privacyPolicyConsent(user: UserRecord) {
	return {
		version: user.privacyPolicyAcceptedVersion,
		acceptedAt: user.privacyPolicyAcceptedAt,
		isLatestVersion: user.privacyPolicyAcceptedVersion === currentPrivacyPolicyVersion,
	}
}

const userResolvers = {
	UserAccountData: { privacyPolicyConsent },

	Query: {
		me: async (_source: unknown, _args: unknown, { user }: UserContext) => user,
		user: async (_source: unknown, { userId }: { userId: string }, { db, ensureSignedIn }: UserContext) => {
			ensureSignedIn()
			return getUser(db, userId)
		},
		allUsers: async (_source: unknown, _args: unknown, { db, ensureAdmin }: UserContext) => {
			ensureAdmin()
			return getAllUsers(db)
		},
	},

	Mutation: {
		setLanguage: async (_source: unknown, { language }: { language: string }, { ensureSignedIn, user }: UserContext) => {
			ensureSignedIn()
			if (!(languages as readonly string[]).includes(language)) throw new Error(`Invalid language setting: the language "${language}" is not in the list of supported languages.`)
			await user!.update({ language })
			return user
		},
		acceptLatestPrivacyPolicy: async (_source: unknown, _args: unknown, { ensureSignedIn, user }: UserContext) => {
			ensureSignedIn()
			if (!user!.privacyPolicyAcceptedVersion || user!.privacyPolicyAcceptedVersion < currentPrivacyPolicyVersion) await user!.update({ privacyPolicyAcceptedVersion: currentPrivacyPolicyVersion, privacyPolicyAcceptedAt: new Date() })
			return user
		},
		deleteAccount: async (_source: unknown, { confirmEmail }: { confirmEmail: string }, { ensureSignedIn, user }: UserContext) => {
			ensureSignedIn()
			if (user!.email !== confirmEmail) throw new InvalidInputError('User shutdown denied: the confirmation email does not match.')
			await user!.destroy()
			return user!.id
		},
	},
}

export function createUserResolvers(sharedDataAccessRules: UserSharedDataAccessRule[] = []) {
	return {
		...userResolvers,
		User: {
			async sharedData(user: UserRecord, _args: unknown, context: UserContext) {
				if (!context.user) return null
				if (context.user.id === user.id || context.isAdmin) return user
				for (const rule of sharedDataAccessRules)
					if (await rule(user, context)) return user
				return null
			},
			accountData(user: UserRecord, _args: unknown, context: UserContext) {
				if (!context.user) return null
				return context.user.id === user.id || context.isAdmin ? user : null
			},
		},
	}
}
