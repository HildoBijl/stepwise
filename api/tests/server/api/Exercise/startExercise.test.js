const surfConextMockData = require('../../../../surfConextMockData.json')
const { createClient } = require('../../../client')

const ALEX_ID = 'a0000000-0000-0000-0000-000000000000'
const ALEX_SURFSUB = 'a000000000000000000000000000000000000000'
const ALEX = surfConextMockData.find(surf => surf.sub === ALEX_SURFSUB)

const SAMPLE_SKILL = 'enterInteger'

const seed = async db => {
	const alex = await db.User.create({ id: ALEX_ID, name: ALEX.name, email: ALEX.email })
	await alex.createSurfConextProfile({ id: ALEX_SURFSUB })
}

describe('startExercise', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
	})

	it('creates a skill when none exists yet', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// First the skill should not exist.
		const { data: { skill: skillBefore }, errors: skillBeforeErrors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId}}` })
		expect(skillBeforeErrors).toBeUndefined()
		expect(skillBefore).toBe(null)

		// Then we start an exercise.
		const { data: { startExercise: exercise }, errors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active startedOn progress lastAction lastActionAt history {action progress performedAt}}}` })
		expect(errors).toBeUndefined()
		expect(exercise).toMatchObject({
			active: true,
			progress: {},
			history: [],
		})

		// After this the skill should exist.
		const { data: { skill: skillAfter }, errors: skillAfterErrors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId activeExercise {id exerciseId state active startedOn progress lastAction lastActionAt history {action progress performedAt}} exercises {id}}}` })
		expect(skillAfterErrors).toBeUndefined()
		expect(skillAfter.skillId).toBe(SAMPLE_SKILL)
		expect(skillAfter.activeExercise).toMatchObject(exercise)
		expect(skillAfter.exercises).toHaveLength(1)
		expect(skillAfter.exercises[0].id).toBe(exercise.id)
	})

	it('gives an error when there already is an active exercise', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// The first exercise we start should be fine.
		const { data: { startExercise: exercise }, errors: errorsBefore } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id}}` })
		expect(errorsBefore).toBeUndefined()
		expect(exercise).not.toBeUndefined()

		// The second exercise we start should give an error.
		const { data, errors: errorsAfter } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id}}` })
		expect(errorsAfter).not.toBeUndefined()
		expect(data).toBe(null)
	})
})
