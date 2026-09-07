import type { CurrentUserRecord, PrivacyPolicyConsentRecord, UserAccountDataRecord, UserRecord, UserSharedDataRecord } from './records.ts'
import type { CurrentUser, PrivacyPolicyConsent, User, UserWithAccountData, UserWithSharedData } from './types.ts'

type UserSharedData = Omit<UserWithSharedData, keyof User>
type UserAccountData = Omit<UserWithAccountData, keyof UserWithSharedData>

export function userRecordToUser(record: UserRecord): User {
	return {
		id: record.id,
		...(record.name === null ? {} : { name: record.name }),
		...(record.givenName === null ? {} : { givenName: record.givenName }),
		...(record.familyName === null ? {} : { familyName: record.familyName }),
	}
}

export function userSharedDataRecordToData(record: UserSharedDataRecord): UserSharedData {
	return record.email === null ? {} : { email: record.email }
}

export function privacyPolicyConsentRecordToConsent(record: PrivacyPolicyConsentRecord): PrivacyPolicyConsent {
	return {
		...(record.version === null ? {} : { version: record.version }),
		...(record.acceptedAt === null ? {} : { acceptedAt: record.acceptedAt }),
		isLatestVersion: record.isLatestVersion,
	}
}

export function userAccountDataRecordToData(record: UserAccountDataRecord): UserAccountData {
	return {
		role: record.role,
		...(record.language === null ? {} : { language: record.language }),
		privacyPolicyConsent: privacyPolicyConsentRecordToConsent(record.privacyPolicyConsent),
		createdAt: record.createdAt,
		updatedAt: record.updatedAt,
	}
}

export function currentUserRecordToUser(record: CurrentUserRecord): CurrentUser {
	const { sharedData, accountData } = record
	return {
		...userRecordToUser(record),
		...userSharedDataRecordToData(sharedData),
		...userAccountDataRecordToData(accountData),
	}
}
