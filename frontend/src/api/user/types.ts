import type { Language } from '@step-wise/settings'

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
	createdAt: string
	updatedAt: string
}

export type CurrentUser = UserWithAccountData
