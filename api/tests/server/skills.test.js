const { createClient, defaultConfig } = require('../client')

const SPECIAL_USER_ID = '01010101-0101-0101-0101-010101010101'
const SPECIAL_USER_SUB = '00000000-0000-0000-0000-000000000000'

const seed = async db => {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_SUB,
	})
	await user.createSkill({
		skillId: 'fillIn',
	})
}

describe('mySkills', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{mySkills {id skillId name}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
	})

	it('only gives data on existing skills', async () => {
		const client = await createClient(seed)

		await client.login(SPECIAL_USER_SUB)

		const { data: { mySkills }, errors } = await client.graphql({ query: `{mySkills {id skillId name}}` })
		expect(errors).toBeUndefined()
		expect(mySkills).toHaveLength(1)
		expect(mySkills[0]).toMatchObject({ skillId: 'fillIn' })
	})
})
