const { createClient, defaultConfig } = require('../../client')

const ADMIN_ID = '00000000-0000-0000-0000-000000000000'
const ADMIN_SURFSUB = '0000000000000000000000000000000000000000'
const STUDENT_ID = '11111111-1111-1111-1111-111111111111'
const STUDENT_SURFSUB = '1111111111111111111111111111111111111111'
const NONEXISTING_ID = '22222222-2222-2222-2222-222222222222'

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
}

describe('user', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${STUDENT_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives an error when a student accesses user data', async () => {
		const client = await createClient(seed)
		await client.login(STUDENT_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${ADMIN_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('throws an error when no user is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.login(ADMIN_SURFSUB)

		expect(() => client.graphql({ query: `{user {id}}` }))
			.rejects
			.toThrow('Bad Request')
	})

	it('gives an error when a non-existing user is given (bad request)', async () => {
		const client = await createClient(seed)
		await client.login(ADMIN_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{user(userId: "${NONEXISTING_ID}") {id}}` })
		expect(data).toStrictEqual({ user: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives user data when an admin gives an appropriate query', async () => {
		const client = await createClient(seed)
		await client.login(ADMIN_SURFSUB)

		const { data: { user }, errors } = await client.graphql({ query: `{user(userId: "${STUDENT_ID}") {id}}` })
		expect(errors).toBeUndefined()
		expect(user).toMatchObject({ id: STUDENT_ID })
	})
})

describe('shutdown account', () => {
	it('shuts down the logged-in user account', async () => {
		const client = await createClient(seed)
		await client.login(STUDENT_SURFSUB)

		const { data: shutdownData, errors: shutdownErrors } = await client.graphql(
			{ query: `mutation {shutdownAccount(confirmEmail: "student@wise.com")}` }
		)
		expect(shutdownErrors).toBeUndefined()
		expect(shutdownData).toMatchObject({ shutdownAccount: STUDENT_ID })

		const { data: { me }, errors: fetchErrors } = await client.graphql(
			{ query: `{me {name}}` }
		)
		expect(fetchErrors).toBeUndefined()
		expect(me).toBeNull()
	})

	it('cannot shutdown account if not logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql(
			{ query: `mutation {shutdownAccount(confirmEmail: "student@wise.com")}` }
		)
		expect(errors).not.toBeUndefined()
		expect(data).toBeNull()
	})

	it('cannot shutdown user account if confirmation email does not match up', async () => {
		const client = await createClient(seed)
		await client.login(STUDENT_SURFSUB)

		const { data, errors } = await client.graphql(
			{ query: `mutation {shutdownAccount(confirmEmail: "foo@asdf.com")}` }
		)
		expect(errors).not.toBeUndefined()
		expect(data).toBeNull()
	})
})
