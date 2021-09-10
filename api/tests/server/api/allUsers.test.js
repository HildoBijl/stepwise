const { createClient, defaultConfig } = require('../../client')

const ADMIN_ID = '00000000-0000-0000-0000-000000000000'
const ADMIN_SURFSUB = '0000000000000000000000000000000000000000'
const STUDENT_ID = '11111111-1111-1111-1111-111111111111'
const STUDENT_SURFSUB = '1111111111111111111111111111111111111111'
const RANDOM_ID = '22222222-2222-2222-2222-222222222222'

const seed = async db => {
	const student = await db.User.create({
		id: STUDENT_ID,
		name: 'Student',
		email: 'student@wise.com',
	})
	await student.createSurfConextProfile({
		id: STUDENT_SURFSUB,
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
	await db.User.create({
		id: RANDOM_ID,
		name: 'Random',
		email: 'random@wise.com',
	})
}

describe('allUsers', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{allUsers {id}}` })
		expect(data).toStrictEqual({ allUsers: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives an error when a student accesses user data', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{allUsers {id}}` })
		expect(data).toStrictEqual({ allUsers: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives all user data when an admin accesses it', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ADMIN_SURFSUB)

		const { data: { allUsers }, errors } = await client.graphql({ query: `{allUsers {id}}` })
		expect(errors).toBeUndefined()
		expect(allUsers).toMatchObject([
			{ id: ADMIN_ID },
			{ id: STUDENT_ID },
			{ id: RANDOM_ID },
		])
	})
})
