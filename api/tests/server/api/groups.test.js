const { createClient, defaultConfig } = require('../../client')
const {create} = require("@hapi/joi/lib/ref");

const STUDENT_LARRY_ID = '11111111-1111-1111-1111-111111111111'
const STUDENT_LARRY_SURFSUB = '1111111111111111111111111111111111111111'
const STUDENT_STACEY_ID = '22222222-2222-2222-2222-222222222222'
const STUDENT_STACEY_SURFSUB = '2222222222222222222222222222222222222222'

const GROUP_CODE_PYHSICS = '8UFH2'

const seed = async db => {
	const studentLarry = await db.User.create({
		id: STUDENT_LARRY_ID,
		name: 'Larry Learner',
		email: 'larry@example.org',
	})
	await studentLarry.createSurfConextProfile({
		id: STUDENT_LARRY_SURFSUB,
	})
	const studentStacey = await db.User.create({
		id: STUDENT_STACEY_ID,
		name: 'Stacey Student',
		email: 'stacey@example.org',
	})
	await studentLarry.createSurfConextProfile({
		id: STUDENT_STACEY_SURFSUB,
	})

	await db.Group.create({
		code: GROUP_CODE_PYHSICS
	})
}

describe('groups', () => {
	it('does not have any groups without joining', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{myGroups{code}}` })
		expect(data).toStrictEqual({ myGroups: [] })
		expect(errors).toBeUndefined()
	})

	it('can create a new group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data: {createGroup}, errors: createErrors} = await client.graphql({
			query: `mutation {createGroup{code}}`
		})
		expect(createErrors).toBeUndefined()
		expect(createGroup.code).toMatch(/[A-Z0-9]{5}/)

		const CODE = createGroup.code

		const {data: {group}, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${CODE}"){members{id}}}`
		})
		expect(groupErrors).toBeUndefined()
		expect(group.members).toHaveLength(0)
	})

	it('can join an existing group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data: {joinGroup}, joinErrors} = await client.graphql({
			query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(joinErrors).toBeUndefined()
		expect(joinGroup).toStrictEqual({code: GROUP_CODE_PYHSICS})

		const {data: {group}, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){members{id, name}}}`
		})
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([{id: STUDENT_LARRY_ID, name: 'Larry Learner'}])

		const {data: {myGroups}, errors: getErrors} = await client.graphql({query: `{myGroups{code}}`})
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(1)
		expect(myGroups[0]).toStrictEqual({code: GROUP_CODE_PYHSICS})
	})

	it('can leave a group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		await client.graphql({query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`})

		const { leaveErrors} = await client.graphql({
			query: `mutation {leaveGroup(code: "${GROUP_CODE_PYHSICS}")}`
		})
		expect(leaveErrors).toBeUndefined()

		const {data: {myGroups}, errors: getErrors} = await client.graphql({query: `{myGroups{code}}`})
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(0)
	})

	it('can delete a group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		await client.graphql({query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`})

		const { leaveErrors} = await client.graphql({
			query: `mutation {deleteGroup(code: "${GROUP_CODE_PYHSICS}")}`
		})
		expect(leaveErrors).toBeUndefined()

		const {data: {myGroups}, errors: getErrors} = await client.graphql({query: `{myGroups{code}}`})
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(0)
	})
})
