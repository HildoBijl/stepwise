import type { Language } from '@step-wise/settings'

export type UserRole = 'student' | 'teacher' | 'admin'

export type UserPublic = {
	id: string
	name: string | null
	givenName: string | null
	familyName: string | null
}

export type UserPrivate = UserPublic & {
	email: string | null
}

export type PrivacyPolicyConsent = {
	version: number | null
	acceptedAt: string | null
	isLatestVersion: boolean
}

export type UserFull = UserPrivate & {
	role: UserRole
	language: Language | null
	privacyPolicyConsent: PrivacyPolicyConsent
	createdAt: string
	updatedAt: string
}

export type CurrentUser = UserFull
