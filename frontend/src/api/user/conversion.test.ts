import { describe, expect, it } from 'vitest'

import { currentUserRecordToUser, privacyPolicyConsentRecordToConsent } from './conversion.ts'

describe('privacyPolicyConsentRecordToConsent', () => {
	it('omits nullable values that are missing', () => {
		expect(privacyPolicyConsentRecordToConsent({ version: null, acceptedAt: null, isLatestVersion: false })).toEqual({
			isLatestVersion: false,
		})
	})
})

describe('currentUserRecordToUser', () => {
	it('omits nullable values while retaining present values', () => {
		expect(currentUserRecordToUser({
			id: 'user-id',
			name: 'Ada Lovelace',
			givenName: null,
			familyName: 'Lovelace',
			email: null,
			role: 'student',
			language: null,
			privacyPolicyConsent: { version: null, acceptedAt: null, isLatestVersion: false },
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-02T00:00:00.000Z',
		})).toEqual({
			id: 'user-id',
			name: 'Ada Lovelace',
			familyName: 'Lovelace',
			role: 'student',
			privacyPolicyConsent: { isLatestVersion: false },
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-01-02T00:00:00.000Z',
		})
	})
})
