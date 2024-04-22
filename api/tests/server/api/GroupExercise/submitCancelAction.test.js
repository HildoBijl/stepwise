const { JSONstringifyWithoutPropertyQuotes } = require('step-wise/util')

const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)

const SAMPLE_SKILL = 'enterInteger'

const GROUP_CODE = 'PHYS'

const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })

	const physicsGroup = await db.Group.create({ code: GROUP_CODE })
	await physicsGroup.addMember(alex.id)
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

describe('submit group action:', () => {
	it('throws an error when no exercise is active', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Activate the group.
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		expect(client.countEvents('GROUP_UPDATED')).toStrictEqual(1)

		// Submit an action.
		const { data, errors } = await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(42))}){skillId active}}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBe(null)
	})

	it('throws an error when not active in the group', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Activate the group, start an exercise and deactivate the group.
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId active}}` })
		await client.graphql({ query: `mutation {deactivateGroup{code}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)

		// Submit an exercise action.
		const { data, errors } = await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(42))}){skillId active}}` })
		expect(errors).not.toBeUndefined()
		expect(data).toBe(null)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)
	})

	it('allows submission, resubmission and canceling of actions', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Activate the group and start an exercise.
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId active}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)

		// Submit a first action.
		const action1 = inputAction(42)
		const { data: { submitGroupAction: submitExercise }, errors: submitErrors } = await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(action1)}){skillId history{submissions{userId action}}}}` })
		expect(submitErrors).toBeUndefined()
		expect(submitExercise.history[0].submissions.length).toStrictEqual(1)
		expect(submitExercise.history[0].submissions[0].action).toStrictEqual(action1)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(2)

		// Submit a second action.
		const action2 = inputAction(28)
		const { data: { submitGroupAction: resubmitExercise }, errors: resubmitErrors } = await client.graphql({ query: `mutation{submitGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(action2)}){skillId history{submissions{userId action}}}}` })
		expect(resubmitErrors).toBeUndefined()
		expect(resubmitExercise.history[0].submissions.length).toStrictEqual(1)
		expect(resubmitExercise.history[0].submissions[0].action).toStrictEqual(action2)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(3)

		// Cancel the action.
		const { data: { cancelGroupAction: cancelExercise }, errors: cancelErrors } = await client.graphql({ query: `mutation{cancelGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}"){skillId history{submissions{userId action}}}}` })
		expect(cancelErrors).toBeUndefined()
		expect(cancelExercise.history[0].submissions.length).toStrictEqual(0)
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(4)
	})
})

describe('cancel group action:', () => {
	it('does nothing when there is no action to cancel', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Activate the group and start an exercise.
		await client.graphql({ query: `mutation {activateGroup(code: "${GROUP_CODE}"){code}}` })
		await client.graphql({ query: `mutation{startGroupExercise(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}") {skillId active}}` })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)

		// Cancel the action.
		const { data: { cancelGroupAction: exercise }, errors } = await client.graphql({ query: `mutation{cancelGroupAction(code: "${GROUP_CODE}", skillId: "${SAMPLE_SKILL}"){skillId}}` })
		expect(errors).toBeUndefined()
		expect(exercise).toStrictEqual({ skillId: SAMPLE_SKILL })
		expect(client.countEvents('GROUP_EXERCISE_UPDATED')).toStrictEqual(1)
	})
})
