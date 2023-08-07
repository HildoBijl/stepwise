const { toFO } = require('step-wise/inputTypes')
const { JSONstringifyWithoutPropertyQuotes } = require('step-wise/util/objects')

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

const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const bob = await db.User.create({ id: BOB_ID, name: BOB.name, email: BOB.email })
	await bob.createSurfConextProfile({ id: BOB_SURFSUB })

	const physicsGroup = await db.Group.create({ code: GROUP_CODE })
	await physicsGroup.addMember(alex.id)
	await physicsGroup.addMember(bob.id)
}

const inputAction = (ans) => ({
	type: "input",
	input: {
		ans: {
			type: "Integer",
			value: ans.toString(),
		}
	}
})

describe('resolve group exercise:', () => {
	it('throws an error when not everyone submitted', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Activate the group, start an exercise and make a submission.
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId active}}` })
		await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(42))}){skillId}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(2)

		// Resolving the event fails.
		const { data, errors } = await client.graphql({ query: `mutation{resolveGroupEvent(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}"){skillId history{submissions{userId action}}}}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBe(null)
	})

	it('works when everyone submitted', async () => {
		const client = await createClient(seed)

		// Log in as Alex, activate the group, start an exercise, make a wrong submission and log out.
		await client.loginSurfConext(ALEX_SURFSUB)
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		const { data: { startGroupExercise: exercise } } = await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {state}}` })
		const state = toFO(exercise.state)
		await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(state.x + 1))}){skillId}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(2)
		await client.logout()

		// Log in as Bob, activate the group and make a wrong submission.
		await client.loginSurfConext(BOB_SURFSUB)
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(state.x - 1))}){skillId}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(3)

		// Resolve the event.
		const { data: { resolveGroupEvent: resolvedExercise1 }, errors1 } = await client.graphql({ query: `mutation{resolveGroupEvent(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}"){skillId active}}` })
		expect(errors1).toBeUndefined()
		expect(resolvedExercise1).toStrictEqual({ skillId: SAMPLE_SKILL, active: true })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(4)

		// Make another wrong submission and log out.
		await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(state.x + 1))}){skillId}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(5)
		await client.logout()

		// Log in as Alex and make a correct submission.
		await client.loginSurfConext(ALEX_SURFSUB)
		await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(state.x))}){skillId}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(6)

		// Resolve the event.
		const { data: { resolveGroupEvent: resolvedExercise2 }, errors2 } = await client.graphql({ query: `mutation{resolveGroupEvent(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}"){skillId active}}` })
		expect(errors2).toBeUndefined()
		expect(resolvedExercise2).toStrictEqual({ skillId: SAMPLE_SKILL, active: false })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(7)
	})
})
