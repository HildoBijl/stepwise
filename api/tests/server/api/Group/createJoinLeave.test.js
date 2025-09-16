const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(surf => surf.sub === BOB_SURFSUB)

const GROUP_CODE = 'PHYS'

const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })

	const physicsGroup = await db.Group.create({ code: GROUP_CODE })
	await physicsGroup.addMember(bob.id)
}

describe('creating group:', () => {
	it('can create a new group and automatically joins it', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Create a group.
		const { data: { createGroup }, errors: createErrors } = await client.graphql({ query: `mutation {createGroup{code}}` })
		expect(createErrors).toBeUndefined()
		expect(createGroup.code).toMatch(/[A-Z0-9]{4}/)
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Query the result.
		const newCode = createGroup.code
		const { data: { group }, errors: groupErrors } = await client.graphql({ query: `{group(code: "${newCode}"){members{name active}}}` })
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([{ name: ALEX.name, active: true }])
	})

	it('can create (and join) multiple groups', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Create three groups.
		await client.graphql({ query: `mutation {createGroup{code}}` })
		await client.graphql({ query: `mutation {createGroup{code}}` })
		await client.graphql({ query: `mutation {createGroup{code}}` })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(5) // When creating a group, the former group is also adjusted to deactivate the user there.

		// Query the result.
		const { data: { myGroups } } = await client.graphql({ query: `{myGroups{code}}` })
		expect(myGroups).toHaveLength(3)
	})
})

describe('joining group:', () => {
	it('does not have any groups without joining', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Query the groups.
		const { data, errors } = await client.graphql({ query: `{myGroups{code}}` })
		expect(data).toStrictEqual({ myGroups: [] })
		expect(errors).toBeUndefined()
	})

	it('can join an existing group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Join the group.
		const { data: { joinGroup }, errors: joinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(joinErrors).toBeUndefined()
		expect(joinGroup).toStrictEqual({ code: GROUP_CODE })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Query the given group.
		const { data: { group }, errors: groupErrors } = await client.graphql({ query: `{group(code: "${GROUP_CODE}"){members{name active}}}` })
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([{ name: BOB.name, active: false }, { name: ALEX.name, active: true }])

		// Query all groups.
		const { data: { myGroups }, errors: getErrors } = await client.graphql({ query: `{myGroups{code, members{name}}}` })
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(1)
		expect(myGroups[0]).toStrictEqual({
			code: GROUP_CODE,
			members: [{ name: BOB.name }, { name: ALEX.name }],
		})
	})

	it('re-joining has no "negative" effect', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Join the given group.
		const { data: { joinGroup }, errors: joinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(joinErrors).toBeUndefined()
		expect(joinGroup).toStrictEqual({ code: GROUP_CODE })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Rejoin and ensure there are no errors or changes.
		const { errors: rejoinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(rejoinErrors).toBeUndefined()
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Query the group and check that there are no duplicate members.
		const { data: { group }, errors: groupErrors } = await client.graphql({ query: `{group(code: "${GROUP_CODE}"){members{name}}}` })
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([{ name: BOB.name }, { name: ALEX.name }])

		// Query all groups and check that there are no duplicate groups.
		const { data: { myGroups }, errors: getErrors } = await client.graphql({ query: `{myGroups{code}}` })
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(1)
		expect(myGroups[0]).toStrictEqual({ code: GROUP_CODE })
	})

	it('cannot join a non-existing group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Join a non-existing group.
		const { errors: joinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "1234"){code}}` })
		expect(joinErrors[0].extensions).toStrictEqual({ code: 'BAD_USER_INPUT' })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(0)
	})

	it('accepts group codes in lowercase', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Join the group.
		const lowercaseCode = GROUP_CODE.toLowerCase()
		const { data: { joinGroup } } = await client.graphql({ query: `mutation {joinGroup(code: "${lowercaseCode}"){code}}` })
		expect(joinGroup).toStrictEqual({ code: GROUP_CODE })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Query the group.
		const { data: { group } } = await client.graphql({ query: `{group(code: "${lowercaseCode}"){code}}` })
		expect(group).toStrictEqual({ code: GROUP_CODE })

		// Leave the group.
		const { errors: leaveErrors } = await client.graphql({ query: `mutation {leaveGroup(code: "${lowercaseCode}")}` })
		expect(leaveErrors).toBeUndefined()
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(2)
	})
})

describe('leaving groups', () => {
	it('can leave a group (and rejoin afterwards)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Join the group.
		await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Leave the group.
		const { errors: leaveErrors } = await client.graphql({ query: `mutation {leaveGroup(code: "${GROUP_CODE}")}` })
		expect(leaveErrors).toBeUndefined()
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(2)

		// Query the group.
		const { data: { myGroups }, errors: getErrors } = await client.graphql({ query: `{myGroups{code}}` })
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(0)

		// Join the group again. (It is still there, since there is another member.)
		const { errors: rejoinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(rejoinErrors).toBeUndefined()
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(3)
	})

	it('deletes group after the last member has left', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		// Leave the group (as last member).
		const { errors: leaveErrors } = await client.graphql({ query: `mutation {leaveGroup(code: "${GROUP_CODE}")}` })
		expect(leaveErrors).toBeUndefined()
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Try to join and fail.
		const { errors: rejoinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(rejoinErrors[0].extensions).toStrictEqual({ code: 'BAD_USER_INPUT' })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)
	})
})

describe('group existence', () => {
	it('can check that an existing group exists', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Check that an existing group exists.
		const { data: { groupExists }, errors: existsErrors } = await client.graphql({ query: `{groupExists(code: "${GROUP_CODE}")}` })
		expect(existsErrors).toBeUndefined()
		expect(groupExists).toStrictEqual(true)
	})

	it('can check that a non-existing group does not exists', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Check that a non-existing group does not exist.
		const { data: { groupExists }, errors: existsErrors } = await client.graphql({ query: `{groupExists(code: "1234")}` })
		expect(existsErrors).toBeUndefined()
		expect(groupExists).toStrictEqual(false)
	})
})

describe('groups security', () => {
	it('cannot get group data without being a member', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Query the group and fail.
		const { data: groupData, errors: groupErrors } = await client.graphql({ query: `{group(code: "${GROUP_CODE}"){members{name}}}` })
		expect(groupData.group).toBeNull()
		expect(groupErrors[0].extensions).toStrictEqual({ code: 'FORBIDDEN' })
	})

	it('cannot retrieve personal information such as the email address', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Query personal information and fail due to wrong schema.
		expect(() => client.graphql({ query: `{group(code: "${GROUP_CODE}"){members{email}}}` }, 400)).rejects.toThrow('Bad Request')
	})

	it('only allows interactions with groups when logged in', async () => {
		const client = await createClient(seed)

		// Try to query a group when not logged in.
		const { data: groupData, errors: groupErrors } = await client.graphql({ query: `{group(code: "${GROUP_CODE}"){code}}` })
		expect(groupData.group).toBeNull()
		expect(groupErrors[0].extensions).toStrictEqual({ code: 'UNAUTHENTICATED' })

		// Try to create a group when not logged in.
		const { data: createData, errors: createErrors } = await client.graphql({ query: `mutation {createGroup{code}}` })
		expect(createData).toBeNull()
		expect(createErrors[0].extensions).toStrictEqual({ code: 'UNAUTHENTICATED' })

		// Try to join a group when not logged in.
		const { data: joinData, errors: joinErrors } = await client.graphql({ query: `mutation {joinGroup(code: "${GROUP_CODE}"){code}}` })
		expect(joinData).toBeNull()
		expect(joinErrors[0].extensions).toStrictEqual({ code: 'UNAUTHENTICATED' })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(0)
	})
})
