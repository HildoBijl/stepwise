import type { Language } from '@step-wise/settings'

import type { ApiMutationResult } from '../types.ts'

export type UserRole = 'student' | 'teacher' | 'admin'

export type User = {
	id: string
	name?: string
	givenName?: string
	familyName?: string
}

export type UserWithSharedData = User & {
	email?: string
}

export type PrivacyPolicyConsent = {
	version?: number
	acceptedAt?: string
	isLatestVersion: boolean
}

export type UserWithAccountData = UserWithSharedData & {
	role: UserRole
	language?: Language
	privacyPolicyConsent: PrivacyPolicyConsent
	createdAt: Date
	updatedAt: Date
	lastActiveAt: Date
}

export type CurrentUser = UserWithAccountData

export type UseSetLanguageResult = ApiMutationResult<(language: Language) => Promise<void>>
export type UseAcceptLatestPrivacyPolicyResult = ApiMutationResult<() => Promise<void>>
export type UseDeleteAccountResult = ApiMutationResult<(confirmEmail: string) => Promise<void>, { succeeded: boolean }>
