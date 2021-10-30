import { createClient } from '../../client'

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'
const SPECIAL_USER_SURFSUB = '0000000000000000000000000000000000000000'
const SAMPLE_SKILL = 'fillInInteger'
const BACKUP_SKILL = 'summation'

const seed = async db => {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_SURFSUB,
	})
	await user.createSkill({
		skillId: SAMPLE_SKILL,
	})
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
		await client.loginSurfConext(SPECIAL_USER_SURFSUB)

		const { data: { skills }, errors } = await client.graphql({ query: `{skills {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skills).toHaveLength(1)
		expect(skills[0]).toMatchObject({ skillId: SAMPLE_SKILL })
	})

	it('(only) gives data on existing skills for queries with parameters', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(SPECIAL_USER_SURFSUB)

		const { data: { skills }, errors } = await client.graphql({ query: `{skills(skillIds: ["${SAMPLE_SKILL}","${BACKUP_SKILL}"]) {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skills).toHaveLength(1)
		expect(skills[0]).toMatchObject({ skillId: SAMPLE_SKILL })
	})

	it('gives an error when requesting a non-existing skill', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(SPECIAL_USER_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skills(skillIds: ["nonExistingSkill"]) {id skillId}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
	})
})
