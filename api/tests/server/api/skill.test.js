import { createClient } from '../../client'

const ADMIN_ID = '00000000-0000-0000-0000-000000000000'
const ADMIN_SURFSUB = '0000000000000000000000000000000000000000'
const STUDENT_ID = '11111111-1111-1111-1111-111111111111'
const STUDENT_SURFSUB = '1111111111111111111111111111111111111111'
const NONEXISTING_SURFSUB = '2222222222222222222222222222222222222222'
const SAMPLE_SKILL = 'fillInInteger'
const NONEXISTING_SKILL = 'abcdefghijklmnopqrstuvwxyz'

const seed = async db => {
	const student = await db.User.create({
		id: STUDENT_ID,
		name: 'Student',
		email: 'student@wise.com',
	})
	await student.createSurfConextProfile({
		id: STUDENT_SURFSUB,
	})
	await student.createSkill({
		skillId: SAMPLE_SKILL,
	})
	const admin = await db.User.create({
		id: ADMIN_ID,
		name: 'Step Wise',
		email: 'step@wise.com',
		role: 'admin',
	})
	await admin.createSurfConextProfile({
		id: ADMIN_SURFSUB,
	})
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
		await client.loginSurfConext(STUDENT_SURFSUB)

		expect(() => client.graphql({ query: `{skill {id skillId}}` }))
			.rejects
			.toThrow('Bad Request')
	})

	it('gives an error when a non-existing skill is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${NONEXISTING_SKILL}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives skill data when an appropriate query is given', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_SURFSUB)

		const { data: { skill }, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skill).toMatchObject({ skillId: SAMPLE_SKILL })
	})

	it('gives an error when a student accesses other people\'s skills', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}", userId: "${ADMIN_ID}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives an error when an admin uses a non-existing userId', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ADMIN_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}", userId: "${NONEXISTING_SURFSUB}") {id skillId}}` })
		expect(data).toStrictEqual({ skill: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives admins access to skill data of other users', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ADMIN_SURFSUB)

		const { data: { skill }, errors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}", userId: "${STUDENT_ID}") {id skillId}}` })
		expect(errors).toBeUndefined()
		expect(skill).toMatchObject({ skillId: SAMPLE_SKILL })
	})
})
