import { describe, expect, it } from 'vitest'

import { currentPrivacyPolicyVersion } from '@step-wise/settings'

import surfConextMockData from '../../../../src/modules/authentication/surfConext/mockData.json' with { type: 'json' }

import { createClient } from '../../../support/client.ts'

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)!
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(surf => surf.sub === BOB_SURFSUB)!
const NONEXISTING_ID = '12345678-1234-1234-1234-1234567890ab'

// Alex is an admin, Bob is a student.
async function seed(db) {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email, role: 'admin' })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })
}

describe('user', () => {
	it('gives an error when no user is signed in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${BOB_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives only public fields when a student accesses user data', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		const { data: { user }, errors } = await client.graphql({
			query: `{user(userId: "${ALEX_ID}") {
				id
				sharedData { email }
				accountData { language }
			}}` })
		expect(errors).toBeUndefined()
		expect(user).toStrictEqual({ id: ALEX_ID, sharedData: null, accountData: null })
	})

	it('throws an error when no user is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(ALEX_SURFSUB)

		const { errors } = await client.graphql({ query: `{user {id}}` }, 400)
		expect(errors).not.toBeUndefined()
	})

	it('gives an error when a non-existing user is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${NONEXISTING_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives user data when an admin gives an appropriate query', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(ALEX_SURFSUB)

		const { data: { user }, errors } = await client.graphql({ query: `{user(userId: "${BOB_ID}") {id sharedData {email} accountData {role}}}` })
		expect(errors).toBeUndefined()
		expect(user).toStrictEqual({
			id: BOB_ID,
			sharedData: { email: BOB.email },
			accountData: { role: 'student' },
		})
	})
})

describe('privacy policy consent', () => {
	it('does not have privacy policy consent by default', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		const { data: { me: { accountData: { privacyPolicyConsent } } }, errors } = await client.graphql({ query: `{me {accountData {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })
		expect(errors).toBeUndefined()
		expect(privacyPolicyConsent).toMatchObject({ acceptedAt: null, isLatestVersion: false, version: null })
	})

	it('accepts current privacy policy', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		const before = new Date().getTime()
		const { data: { acceptLatestPrivacyPolicy: { accountData: { privacyPolicyConsent: acceptedConsent } } }, errors } = await client.graphql({ query: `mutation {acceptLatestPrivacyPolicy {accountData {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })
		const after = new Date().getTime()

		expect(errors).toBeUndefined()
		expect(acceptedConsent.version).toEqual(currentPrivacyPolicyVersion)
		const acceptedAt = new Date(acceptedConsent.acceptedAt).getTime()
		expect(acceptedAt).toBeGreaterThanOrEqual(before)
		expect(acceptedAt).toBeLessThanOrEqual(after)
		expect(acceptedConsent.isLatestVersion).toEqual(true)

		// Double-check that the `me` query yields the same data.
		const { data: { me: { accountData: { privacyPolicyConsent } } } } = await client.graphql({ query: `{me {accountData {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })
		expect(privacyPolicyConsent.version).toEqual(acceptedConsent.version)
		expect(privacyPolicyConsent.acceptedAt).toEqual(acceptedConsent.acceptedAt)
		expect(privacyPolicyConsent.isLatestVersion).toEqual(acceptedConsent.isLatestVersion)
	})

	it('does not overwrite the `acceptedAt` date if version didn\'t advance', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		// Accept the privacy policy.
		const { data: { acceptLatestPrivacyPolicy: { accountData: { privacyPolicyConsent: firstConsent } } } } = await client.graphql({ query: `mutation {acceptLatestPrivacyPolicy {accountData {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })

		// Let time progress a little bit and try to accept it again. It should not change things.
		await new Promise(resolve => setTimeout(resolve, 5))
		const { data: { acceptLatestPrivacyPolicy: { accountData: { privacyPolicyConsent: secondConsent } } } } = await client.graphql({ query: `mutation {acceptLatestPrivacyPolicy {accountData {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })
		expect(firstConsent).toMatchObject(secondConsent)
	})
})

describe('shutdown account', () => {
	it('shuts down the signed-in user account', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		// Shut down the account should give the ID back.
		const { data: shutdownData, errors: shutdownErrors } = await client.graphql({ query: `mutation {deleteAccount(confirmEmail: "${BOB.email}")}` })
		expect(shutdownErrors).toBeUndefined()
		expect(shutdownData).toMatchObject({ deleteAccount: BOB_ID })

		// The account should not be accessible anymore.
		const { data: { me }, errors: fetchErrors } = await client.graphql({ query: `{me {name}}` })
		expect(fetchErrors).toBeUndefined()
		expect(me).toBeNull()
	})

	it('cannot shutdown account if not signed in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `mutation {deleteAccount(confirmEmail: "${BOB.email}")}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBeNull()
	})

	it('cannot shutdown user account if confirmation email does not match up', async () => {
		const client = await createClient(seed)
		await client.signInWithSurfConext(BOB_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation {deleteAccount(confirmEmail: "incorrect@email.address")}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBeNull()
	})
})
