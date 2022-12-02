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

describe('(de)activating groups:', () => {
	it('by default has no group active', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		// Query the given group.
		const { data: { myActiveGroup }, errors: activeGroupErrors } = await client.graphql({ query: `{myActiveGroup{code members{name active}}}` })
		expect(activeGroupErrors).toBeUndefined()
		expect(myActiveGroup).toBe(null)
	})

	it('can activate and deactivate an existing group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(BOB_SURFSUB)

		// Activate the group.
		const { data: { activateGroup }, errors: activateErrors } = await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code members{name active}}}` })
		expect(activateErrors).toBeUndefined()
		expect(activateGroup).toStrictEqual({
			code: GROUP_CODE,
			members: [{ name: BOB.name, active: true }],
		})
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Query the given group.
		const { data: { group }, errors: groupErrors } = await client.graphql({ query: `{group(code: "${GROUP_CODE}"){code members{name active}}}` })
		expect(groupErrors).toBeUndefined()
		expect(group).toStrictEqual({
			code: GROUP_CODE,
			members: [{ name: BOB.name, active: true }],
		})

		// Query the currently active group.
		const { data: { myActiveGroup }, errors: myActiveGroupErrors } = await client.graphql({ query: `{myActiveGroup{code members{name active}}}` })
		expect(myActiveGroupErrors).toBeUndefined()
		expect(myActiveGroup).toStrictEqual({
			code: GROUP_CODE,
			members: [{ name: BOB.name, active: true }],
		})

		// Deactivate the group.
		const { data: { deactivateGroup }, errors: deactivateErrors } = await client.graphql({ query: `mutation {deactivateGroup{code members{name active}}}` })
		expect(deactivateErrors).toBeUndefined()
		expect(deactivateGroup).toStrictEqual({
			code: GROUP_CODE,
			members: [{ name: BOB.name, active: false }],
		})
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(2)

		// Query the given group.
		const { data: { group: groupAgain }, errors: groupErrorsAgain } = await client.graphql({ query: `{group(code: "${GROUP_CODE}"){code members{name active}}}` })
		expect(groupErrorsAgain).toBeUndefined()
		expect(groupAgain).toStrictEqual({
			code: GROUP_CODE,
			members: [{ name: BOB.name, active: false }],
		})

		// Query the currently active group.
		const { data: { myActiveGroup: myActiveGroupAgain }, errors: myActiveGroupErrorsAgain } = await client.graphql({ query: `{myActiveGroup{code members{name}}}` })
		expect(myActiveGroupErrorsAgain).toBeUndefined()
		expect(myActiveGroupAgain).toBe(null)
	})
})
