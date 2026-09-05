import type { CurrentUser, PrivacyPolicyConsent } from './types.ts'
import type { CurrentUserRecord, PrivacyPolicyConsentRecord } from './records.ts'

export function privacyPolicyConsentRecordToConsent(record: PrivacyPolicyConsentRecord): PrivacyPolicyConsent {
	return {
		...(record.version === null ? {} : { version: record.version }),
		...(record.acceptedAt === null ? {} : { acceptedAt: record.acceptedAt }),
		isLatestVersion: record.isLatestVersion,
	}
}

export function currentUserRecordToUser(record: CurrentUserRecord): CurrentUser {
	return {
		id: record.id,
		...(record.name === null ? {} : { name: record.name }),
		...(record.givenName === null ? {} : { givenName: record.givenName }),
		...(record.familyName === null ? {} : { familyName: record.familyName }),
		...(record.email === null ? {} : { email: record.email }),
		role: record.role,
		...(record.language === null ? {} : { language: record.language }),
		privacyPolicyConsent: privacyPolicyConsentRecordToConsent(record.privacyPolicyConsent),
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	}
}
