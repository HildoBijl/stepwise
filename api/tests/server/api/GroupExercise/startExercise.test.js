const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)
const BOB_ID = 'b0000000-0000-0000-0000-000000000000'
const BOB_SURFSUB = 'b000000000000000000000000000000000000000'
const BOB = surfConextMockData.find(surf => surf.sub === BOB_SURFSUB)

const SAMPLE_SKILL = 'fillInInteger'

const GROUP_CODE = 'PHYS'
const OTHER_GROUP_CODE = 'MATH'

const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })

	const physicsGroup = await db.Group.create({ code: GROUP_CODE })
	await physicsGroup.addMember(alex.id)
	await physicsGroup.addMember(bob.id)

	const mathsGroup = await db.Group.create({ code: OTHER_GROUP_CODE })
	await mathsGroup.addMember(bob.id)
}

describe('start group exercise:', () => {
	it('throws an error when not a member of the group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation{startGroupExercise(code: "${OTHER_GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId exerciseId state active}}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBe(null)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(0)
	})

	it('throws an error when not active in the group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId}}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBe(null)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(0)
	})

	it('starts an exercise when being an active member of the group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Activate the group.
		const { data: { activateGroup }, errors: activateErrors } = await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		expect(activateErrors).toBeUndefined()
		expect(activateGroup).toStrictEqual({ code: GROUP_CODE })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Start the exercise.
		const { data: { startGroupExercise: exercise }, errors: startErrors } = await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId active}}` })
		expect(startErrors).toBeUndefined()
		expect(exercise).toStrictEqual({ skillId: SAMPLE_SKILL, active: true })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)

		// Starting an exercise again should not give an error, but should return the same exercise.
		const { data: { startGroupExercise: restartExercise }, errors: restartErrors } = await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId active}}` })
		expect(restartErrors).toBeUndefined()
		expect(restartExercise).toStrictEqual(exercise)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)
	})
})
