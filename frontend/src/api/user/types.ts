import type { Language } from '@step-wise/settings'

export type UserRole = 'student' | 'teacher' | 'admin'

export type UserPublic = {
	id: string
	name?: string
	givenName?: string
	familyName?: string
}

export type UserPrivate = UserPublic & {
	email?: string
}

export type PrivacyPolicyConsent = {
	version?: number
	acceptedAt?: string
	isLatestVersion: boolean
}

export type UserFull = UserPrivate & {
	role: UserRole
	language?: Language
	privacyPolicyConsent: PrivacyPolicyConsent
	createdAt: string
	updatedAt: string
}

export type CurrentUser = UserFull
