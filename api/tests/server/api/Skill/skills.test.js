const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)

const SAMPLE_SKILL = 'fillInInteger'
const BACKUP_SKILL = 'summation'
const NONEXISTING_SKILL = 'abcdefghijklmnopqrstuvwxyz'

const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })
	await alex.createSkill({ skillId: SAMPLE_SKILL })
}

describe('skills', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{skills {id skillId}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
	})

	it('(only) gives data on existing skills for queries without parameters', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data: { skills }, errors } = await client.graphql({ query: `{skills {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skills).toHaveLength(1)
		expect(skills[0]).toMatchObject({ skillId: SAMPLE_SKILL })
	})

	it('(only) gives data on existing skills for queries with parameters', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data: { skills }, errors } = await client.graphql({ query: `{skills(skillIds: ["${SAMPLE_SKILL}","${BACKUP_SKILL}"]) {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skills).toHaveLength(1)
		expect(skills[0]).toMatchObject({ skillId: SAMPLE_SKILL })
	})

	it('gives an error when requesting a non-existing skill', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skills(skillIds: ["${NONEXISTING_SKILL}"]) {id skillId}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
	})
})
