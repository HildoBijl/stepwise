const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(surf => surf.sub === BOB_SURFSUB)
const CAROL_ID = 'c0000000-0000-0000-0000-000000000000'
const CAROL_SURFSUB = 'c000000000000000000000000000000000000000'
const CAROL = surfConextMockData.find(surf => surf.sub === CAROL_SURFSUB)

// Alex is an admin, Bob and Carol are students.
const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email, role: 'admin' })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })

	const carol = await db.User.create({ id: CAROL_ID, name: CAROL.name, email: CAROL.email })
	await carol.createSurfConextProfile({ id: CAROL_SURFSUB })
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
		await client.loginSurfConext(BOB_SURFSUB)

		const { data, errors } = await client.graphql({ query: `{allUsers {id}}` })
		expect(data).toStrictEqual({ allUsers: null })
		expect(errors).not.toBeUndefined()
	})

	it('gives all user data when an admin accesses it', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data: { allUsers }, errors } = await client.graphql({ query: `{allUsers {id}}` })
		expect(errors).toBeUndefined()
		expect(allUsers.map(a => a.id).sort()).toEqual([ALEX_ID, BOB_ID,CAROL_ID].sort())
	})
})
