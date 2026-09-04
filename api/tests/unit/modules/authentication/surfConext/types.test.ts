import { describe, expect, it } from 'vitest'

import { ensureSurfConextIdentities, isSurfConextIdentity } from '../../../../../src/modules/authentication/surfConext/types.ts'

describe('SURFconext identity validation', () => {
	it('accepts minimal and complete identities while retaining unknown claims', () => {
		expect(isSurfConextIdentity({ sub: 'subject' })).toBe(true)
		expect(isSurfConextIdentity({
			sub: 'subject',
			databaseId: null,
			name: 'User',
			given_name: null,
			family_name: 'Name',
			email: 'user@example.org',
			schac_home_organization: 'example.org',
			schac_personal_unique_code: ['code'],
			locale: 'nl',
			eduperson_affiliation: ['student'],
			unknown_claim: { retained: true },
		})).toBe(true)
	})

	it.each([
		null,
		{},
		{ sub: 1 },
		{ sub: 'subject', email: 1 },
		{ sub: 'subject', schac_personal_unique_code: 'code' },
		{ sub: 'subject', schac_personal_unique_code: [1] },
		{ sub: 'subject', eduperson_affiliation: ['student', 1] },
	])('rejects malformed identities', value => {
		expect(isSurfConextIdentity(value)).toBe(false)
	})

	it('asserts arrays of valid identities', () => {
		const identities: unknown = [{ sub: 'one' }, { sub: 'two', email: null }]
		expect(() => ensureSurfConextIdentities(identities)).not.toThrow()
		expect(() => ensureSurfConextIdentities({ sub: 'one' })).toThrow(TypeError)
		expect(() => ensureSurfConextIdentities([{ sub: 'one' }, { sub: 2 }])).toThrow(TypeError)
	})
})
