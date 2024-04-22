const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(surf => surf.sub === BOB_SURFSUB)
const NONEXISTING_SURFSUB = '1234567890abcdef1234567890abcdef12345678'

const SAMPLE_SKILL = 'enterInteger'
const NONEXISTING_SKILL = 'abcdefghijklmnopqrstuvwxyz'

// Alex is an admin, Bob is a student.
const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email, role: 'admin' })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })
	await bob.createSkill({ skillId: SAMPLE_SKILL })
}

describe('skill', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('throws an error when no skill is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		expect(() => client.graphql({ query: `{skill {id skillId}}` })).rejects.toThrow('Bad Request')
	})

	it('gives an error when a non-existing skill is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${NONEXISTING_SKILL}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives skill data when an appropriate query is given', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const { data: { skill }, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skill).toMatchObject({ skillId: SAMPLE_SKILL })
	})

	it('gives an error when a student accesses other people\'s skills', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}", userId: "${ALEX_ID}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives an error when an admin uses a non-existing userId', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}", userId: "${NONEXISTING_SURFSUB}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives admins access to skill data of other users', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data: { skill }, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}", userId: "${BOB_ID}") {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skill).toMatchObject({ skillId: SAMPLE_SKILL })
	})
})
