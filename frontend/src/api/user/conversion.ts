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
	const { sharedData, accountData } = record
	return {
		id: record.id,
		...(record.name === null ? {} : { name: record.name }),
		...(record.givenName === null ? {} : { givenName: record.givenName }),
		...(record.familyName === null ? {} : { familyName: record.familyName }),
		...(sharedData.email === null ? {} : { email: sharedData.email }),
		role: accountData.role,
		...(accountData.language === null ? {} : { language: accountData.language }),
		privacyPolicyConsent: privacyPolicyConsentRecordToConsent(accountData.privacyPolicyConsent),
		createdAt: accountData.createdAt,
		updatedAt: accountData.updatedAt,
	}
}
