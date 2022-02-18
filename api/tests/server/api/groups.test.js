const { createClient, defaultConfig } = require('../../client')

const STUDENT_LARRY_ID = '11111111-1111-1111-1111-111111111111'
const STUDENT_LARRY_SURFSUB = '1111111111111111111111111111111111111111'
const STUDENT_STACEY_ID = '22222222-2222-2222-2222-222222222222'
const STUDENT_STACEY_SURFSUB = '2222222222222222222222222222222222222222'

const GROUP_CODE_PYHSICS = '8UF2'

const seed = async db => {
	const studentLarry = await db.User.create({
		id: STUDENT_LARRY_ID,
		name: 'Larry Learner',
		givenName: 'Larry',
		familyName: 'Learner',
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
	await studentStacey.createSurfConextProfile({
		id: STUDENT_STACEY_SURFSUB,
	})

	const physicsGroup = await db.Group.create({
		code: GROUP_CODE_PYHSICS
	})
	physicsGroup.addMember(studentStacey.id)
}

describe('groups', () => {
	it('does not have any groups without joining', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data, errors} = await client.graphql({query: `{myGroups{code}}`})
		expect(data).toStrictEqual({myGroups: []})
		expect(errors).toBeUndefined()
	})

	it('accepts group codes in lowercase', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const lowercaseGroupCode = GROUP_CODE_PYHSICS.toLowerCase()

		const {data: {joinGroup} } = await client.graphql({
			query: `mutation {joinGroup(code: "${lowercaseGroupCode}"){code}}`
		})
		expect(joinGroup).toStrictEqual({code: GROUP_CODE_PYHSICS})

		const {data: {group} } = await client.graphql({
			query: `{group(code: "${lowercaseGroupCode}"){code}}`
		})
		expect(group).toStrictEqual({code: GROUP_CODE_PYHSICS})

		const { errors: leaveErrors } = await client.graphql({
			query: `mutation {leaveGroup(code: "${lowercaseGroupCode}")}`
		})
		expect(leaveErrors).toBeUndefined()
	})
})

describe('creating groups', () => {
	it('can create a new group and automatically joins it', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data: {createGroup}, errors: createErrors} = await client.graphql({
			query: `mutation {createGroup{code}}`
		})
		expect(createErrors).toBeUndefined()
		expect(createGroup.code).toMatch(/[A-Z0-9]{4}/)

		const newGroupCode = createGroup.code

		const {data: {group}, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${newGroupCode}"){members{name, givenName, familyName}}}`
		})
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([
			{name: 'Larry Learner', givenName: 'Larry', familyName: 'Learner'}
		])
	})

	it('can create (and join) multiple groups', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		await client.graphql({
			query: `mutation {createGroup{code}}`
		})
		await client.graphql({
			query: `mutation {createGroup{code}}`
		})
		await client.graphql({
			query: `mutation {createGroup{code}}`
		})

		const {data: {myGroups}} = await client.graphql({query: `{myGroups{code}}`})
		expect(myGroups).toHaveLength(3)
	})
})

describe('joining groups', () => {
	it('can join an existing group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data: {joinGroup}, errors: joinErrors} = await client.graphql({
			query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(joinErrors).toBeUndefined()
		expect(joinGroup).toStrictEqual({code: GROUP_CODE_PYHSICS})

		const {data: {group}, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){members{name}}}`
		})
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([
			{name: 'Stacey Student'},
			{name: 'Larry Learner'},
		])

		const {data: {myGroups}, errors: getErrors} = await client.graphql(
			{query: `{myGroups{code, members{name}}}`}
		)
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(1)
		expect(myGroups[0]).toStrictEqual({
			code: GROUP_CODE_PYHSICS,
			members: [{name: 'Stacey Student'}, {name: 'Larry Learner'}],
		})
	})

	it('re-joining has no "negative" effect', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data: {joinGroup}, errors: joinErrors} = await client.graphql({
			query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(joinErrors).toBeUndefined()
		expect(joinGroup).toStrictEqual({code: GROUP_CODE_PYHSICS})

		// Re-joining is a noop.
		const {errors: rejoinErrors} = await client.graphql({
			query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(rejoinErrors).toBeUndefined()

		// It doesn’t result in duplicate group membership.
		const {data: {group}, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){members{name}}}`
		})
		expect(groupErrors).toBeUndefined()
		expect(group.members).toStrictEqual([
			{name: 'Stacey Student'},
			{name: 'Larry Learner'},
		])

		const {data: {myGroups}, errors: getErrors} = await client.graphql({query: `{myGroups{code}}`})
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(1)
		expect(myGroups[0]).toStrictEqual({code: GROUP_CODE_PYHSICS})
	})

	it('cannot join a non-existing group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {errors: joinErrors} = await client.graphql({
			query: `mutation {joinGroup(code: "1234"){code}}`
		})
		expect(joinErrors[0].extensions).toStrictEqual({code: 'BAD_USER_INPUT'})
	})
})

describe('leaving groups', () => {
	it('can leave a group (and rejoin afterwards)', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		await client.graphql({query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`})

		const { errors: leaveErrors } = await client.graphql({
			query: `mutation {leaveGroup(code: "${GROUP_CODE_PYHSICS}")}`
		})
		expect(leaveErrors).toBeUndefined()

		const {data: {myGroups}, errors: getErrors } = await client.graphql({query: `{myGroups{code}}`})
		expect(getErrors).toBeUndefined()
		expect(myGroups).toHaveLength(0)

		// The group wasn’t entirely deleted, since Stacey is still a member.
		// Therefore, it can be re-joined after having left.
		const { errors: rejoinErrors } = await client.graphql({
			query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(rejoinErrors).toBeUndefined()
	})

	it('deletes group after the last member has left', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_STACEY_SURFSUB)

		// Stacey is the only member of the physics group, so her leaving should
		// delete the entire group.
		const { errors: leaveErrors } = await client.graphql({
			query: `mutation {leaveGroup(code: "${GROUP_CODE_PYHSICS}")}`
		})
		expect(leaveErrors).toBeUndefined()

		// The group is no longer available for joining.
		const {errors: rejoinErrors} = await client.graphql({query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`})
		expect(rejoinErrors[0].extensions).toStrictEqual({ code: 'BAD_USER_INPUT' })
	})
})

describe('groups security', () => {
	it('cannot get group data without being a member', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		const {data: groupData, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){members{name}}}`
		})
		expect(groupData.group).toBeNull()
		expect(groupErrors[0].extensions).toStrictEqual({code: 'FORBIDDEN'})
	})

	it('cannot retrieve personal information such as the email address', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(STUDENT_LARRY_SURFSUB)

		expect(() => client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){members{email}}}`
		})).rejects.toThrow('Bad Request')

		expect(() => client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){members{id}}}`
		})).rejects.toThrow('Bad Request')
	})

	it('only allows interactions with groups when logged in', async () => {
		const client = await createClient(seed)

		const { data: createData, errors: createErrors } = await client.graphql({
			query: `mutation {createGroup{code}}`
		})
		expect(createData).toBeNull()
		expect(createErrors[0].extensions).toStrictEqual({ code: 'UNAUTHENTICATED' })

		const { data: joinData, errors: joinErrors } = await client.graphql({
			query: `mutation {joinGroup(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(joinData).toBeNull()
		expect(joinErrors[0].extensions).toStrictEqual({ code: 'UNAUTHENTICATED' })

		const { data: groupData, errors: groupErrors} = await client.graphql({
			query: `{group(code: "${GROUP_CODE_PYHSICS}"){code}}`
		})
		expect(groupData.group).toBeNull()
		expect(groupErrors[0].extensions).toStrictEqual({ code: 'UNAUTHENTICATED' })
	})
})
