const { createClient, defaultConfig } = require('../../client')

const SPECIAL_USER_ID = '01010101-0101-0101-0101-010101010101'
const SPECIAL_USER_SUB = '00000000-0000-0000-0000-000000000000'
const SAMPLE_SKILL = 'fillInInteger'

const seed = async db => {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_SUB,
	})
	const skill = await user.createSkill({
		skillId: SAMPLE_SKILL,
	})
}

describe('skill', () => {
	it('throws an error when no skill is given (bad request)', async () => {
		const client = await createClient(seed)

		expect(() => client.graphql({ query: `{skill {id skillId}}` }))
			.rejects
			.toThrow('Bad Request')
	})

	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives skill data when an appropriate query is given', async () => {
		const client = await createClient(seed)
		await client.login(SPECIAL_USER_SUB)

		const { data: { skill }, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skill).toMatchObject({ skillId: SAMPLE_SKILL })
	})
})
