import type { Language } from '@step-wise/settings'

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
	language: Language | null
	privacyPolicyConsent: PrivacyPolicyConsentRecord
	createdAt: string
	updatedAt: string
}

export type CurrentUserRecord = UserRecord & {
	sharedData: UserSharedDataRecord
	accountData: UserAccountDataRecord
}
