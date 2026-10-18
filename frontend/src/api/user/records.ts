import type { UserRole } from './types.ts'

export type UserRecord = {
	id: string
	name: string | null
	givenName: string | null
	familyName: string | null
}

export type UserSharedDataRecord = {
	email: string | null
}

export type PrivacyPolicyConsentRecord = {
	version: number | null
	acceptedAt: string | null
	isLatestVersion: boolean
}

export type UserAccountDataRecord = {
	role: UserRole
	language: string | null
	privacyPolicyConsent: PrivacyPolicyConsentRecord
	createdAt: string
	updatedAt: string
	lastActiveAt: string
}

export type UserWithAccountDataRecord = UserRecord & {
	sharedData: UserSharedDataRecord
	accountData: UserAccountDataRecord
}
