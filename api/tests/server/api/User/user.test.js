const { currentPrivacyPolicyVersion } = require('../../../../../shared/settings')
const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(surf => surf.sub === BOB_SURFSUB)
const NONEXISTING_ID = '12345678-1234-1234-1234-1234567890ab'

// Alex is an admin, Bob is a student.
const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email, role: 'admin' })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })
}

describe('user', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${BOB_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives only public fields when a student accesses user data', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const { data: { user }, errors } = await client.graphql({
			query: `{user(userId: "${ALEX_ID}") {
				id
				... on UserPrivate { email }
				... on UserFull {	language }
			}}` })
		expect(errors).toBeUndefined()
		expect(user).toMatchObject({ id: ALEX_ID })
	})

	it('throws an error when no user is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		expect(() => client.graphql({ query: `{user {id}}` }, 400)).rejects.toThrow('Bad Request')
	})

	it('gives an error when a non-existing user is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${NONEXISTING_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives user data when an admin gives an appropriate query', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data: { user }, errors } = await client.graphql({ query: `{user(userId: "${BOB_ID}") {id}}` })
		expect(errors).toBeUndefined()
		expect(user).toMatchObject({ id: BOB_ID })
	})
})

describe('privacy policy consent', () => {
	it('does not have privacy policy consent by default', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const { data: { me: { privacyPolicyConsent } }, errors } = await client.graphql({ query: `{me {... on UserFull {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })
		expect(errors).toBeUndefined()
		expect(privacyPolicyConsent).toMatchObject({ acceptedAt: null, isLatestVersion: false, version: null })
	})

	it('accepts current privacy policy', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const before = new Date().getTime()
		const { data: { acceptLatestPrivacyPolicy }, errors } = await client.graphql({ query: `mutation {acceptLatestPrivacyPolicy {version, acceptedAt, isLatestVersion}}` })
		const after = new Date().getTime()

		expect(errors).toBeUndefined()
		expect(acceptLatestPrivacyPolicy.version).toEqual(currentPrivacyPolicyVersion)
		const acceptedAt = new Date(acceptLatestPrivacyPolicy.acceptedAt).getTime()
		expect(acceptedAt).toBeGreaterThanOrEqual(before)
		expect(acceptedAt).toBeLessThanOrEqual(after)
		expect(acceptLatestPrivacyPolicy.isLatestVersion).toEqual(true)

		// Double-check that the `me` query yields the same data.
		const { data: { me: { privacyPolicyConsent } } } = await client.graphql({ query: `{me {... on UserFull {privacyPolicyConsent {version, acceptedAt, isLatestVersion}}}}` })
		expect(privacyPolicyConsent.version).toEqual(acceptLatestPrivacyPolicy.version)
		expect(privacyPolicyConsent.acceptedAt).toEqual(acceptLatestPrivacyPolicy.acceptedAt)
		expect(privacyPolicyConsent.isLatestVersion).toEqual(acceptLatestPrivacyPolicy.isLatestVersion)
	})

	it('does not overwrite the `acceptedAt` date if version didn\'t advance', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		// Accept the privacy policy.
		const { data: { acceptLatestPrivacyPolicy: firstConsent } } = await client.graphql({ query: `mutation {acceptLatestPrivacyPolicy {version, acceptedAt, isLatestVersion}}` })

		// Let time progress a little bit and try to accept it again. It should not change things.
		await new Promise(resolve => setTimeout(resolve, 5))
		const { data: { acceptLatestPrivacyPolicy: secondConsent } } = await client.graphql({ query: `mutation {acceptLatestPrivacyPolicy {version, acceptedAt, isLatestVersion}}` })
		expect(firstConsent).toMatchObject(secondConsent)
	})
})

describe('shutdown account', () => {
	it('shuts down the logged-in user account', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		// Shut down the account should give the ID back.
		const { data: shutdownData, errors: shutdownErrors } = await client.graphql({ query: `mutation {shutdownAccount(confirmEmail: "${BOB.email}")}` })
		expect(shutdownErrors).toBeUndefined()
		expect(shutdownData).toMatchObject({ shutdownAccount: BOB_ID })

		// The account should not be accessible anymore.
		const { data: { me }, errors: fetchErrors } = await client.graphql({ query: `{me {name}}` })
		expect(fetchErrors).toBeUndefined()
		expect(me).toBeNull()
	})

	it('cannot shutdown account if not logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `mutation {shutdownAccount(confirmEmail: "${BOB.email}")}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBeNull()
	})

	it('cannot shutdown user account if confirmation email does not match up', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation {shutdownAccount(confirmEmail: "incorrect@email.address")}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBeNull()
	})
})
