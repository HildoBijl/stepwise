import { describe, expect, it } from 'vitest'

import { privacyPolicyConsentRecordToConsent, userWithAccountDataRecordToUser } from './conversion.ts'

describe('privacyPolicyConsentRecordToConsent', () => {
	it('omits nullable values that are missing', () => {
		expect(privacyPolicyConsentRecordToConsent({ version: null, acceptedAt: null, isLatestVersion: false })).toEqual({
			isLatestVersion: false,
		})
	})
})

describe('userWithAccountDataRecordToUser', () => {
	it('omits nullable values while retaining present values', () => {
		expect(userWithAccountDataRecordToUser({
			id: 'user-id',
			name: 'Ada Lovelace',
			givenName: null,
			familyName: 'Lovelace',
			sharedData: { email: null },
			accountData: {
				role: 'student',
				language: null,
				privacyPolicyConsent: { version: null, acceptedAt: null, isLatestVersion: false },
				createdAt: '2026-01-01T00:00:00.000Z',
				updatedAt: '2026-01-02T00:00:00.000Z',
				lastActiveAt: '2026-01-03T12:30:00.000Z',
			},
		})).toEqual({
			id: 'user-id',
			name: 'Ada Lovelace',
			familyName: 'Lovelace',
			role: 'student',
			privacyPolicyConsent: { isLatestVersion: false },
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-02T00:00:00.000Z'),
			lastActiveAt: new Date('2026-01-03T12:30:00.000Z'),
		})
	})
})
