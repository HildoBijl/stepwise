const { toFO } = require('step-wise/inputTypes')
const { JSONstringifyWithoutPropertyQuotes } = require('step-wise/util')

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

const inputAction = (ans) => ({
	type: "input",
	input: {
		ans: {
			type: "Integer",
			value: ans.toString(),
		}
	}
})

describe('submitExerciseAction', () => {
	it('gives an error when no user is logged in', async () => {
		const client = await createClient(seed)

		const { data, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(42))}) {updatedExercise {id}}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(0)
	})

	it('gives an error when no exercise is active', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(42))}) {updatedExercise {id}}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(0)
	})

	it('remembers a wrong submission', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Start an exercise.
		const { data: { startExercise: exercise }, errors: startExerciseErrors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active}}` })
		expect(startExerciseErrors).toBeUndefined()
		const state = toFO(exercise.state)
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(0)

		// Submit a wrong solution.
		const action = inputAction(state.x + 1)
		const { data: { submitExerciseAction: { updatedExercise } }, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(action)}) {updatedExercise {id exerciseId state active history {action progress}}}}` })
		expect(errors).toBeUndefined()
		expect(updatedExercise).toMatchObject(exercise)
		expect(updatedExercise.history).toHaveLength(1)
		expect(updatedExercise.history[0].progress).toEqual({})
		expect(updatedExercise.history[0].action).toEqual(action)
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(1)

		// Submit another wrong solution.
		const secondAction = inputAction(state.x + 2)
		const { data: { submitExerciseAction: { updatedExercise: reupdatedExercise } }, errors: secondActionErrors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(secondAction)}) {updatedExercise {history {action progress}}}}` })
		expect(secondActionErrors).toBeUndefined()
		expect(reupdatedExercise.history).toHaveLength(2)
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(2)
	})

	it('processes a correct solution so a new exercise can be started', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(ALEX_SURFSUB)

		// Start an exercise.
		const { data: { startExercise: exercise }, errors: startExerciseErrors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active}}` })
		expect(startExerciseErrors).toBeUndefined()
		const state = toFO(exercise.state)
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(0)

		// Submit a right solution.
		const action = inputAction(state.x)
		const { data: { submitExerciseAction: { updatedExercise } }, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(action)}) {updatedExercise {id exerciseId state active progress history {action progress}}}}` })
		expect(errors).toBeUndefined()
		expect(updatedExercise.active).toBe(false)
		expect(updatedExercise.progress).toMatchObject({ done: true })
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(1)

		// Check that no exercise is active.
		const { data: { skill: skillAfterSolving }, errors: skillAfterSolvingErrors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId ... on SkillWithExercises {activeExercise {id exerciseId state active}}}}` })
		expect(skillAfterSolvingErrors).toBeUndefined()
		expect(skillAfterSolving.activeExercise).toBe(null)

		// Start a new exercise and check that we can start it.
		const { data: { startExercise: secondExercise }, errors: secondExerciseErrors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active}}` })
		expect(secondExerciseErrors).toBeUndefined()
		expect(secondExercise).toMatchObject({ active: true })
		expect(client.countEvents('SKILLS_UPDATED')).toStrictEqual(1)

		// Check that the right exercise is active.
		const { data: { skill: skillAfterRestart }, errors: skillAfterRestartErrors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId ... on SkillWithExercises {activeExercise {id exerciseId state active} exercises {id}}}}` })
		expect(skillAfterRestartErrors).toBeUndefined()
		expect(skillAfterRestart.activeExercise).toMatchObject(secondExercise)
		expect(skillAfterRestart.exercises).toHaveLength(2)
	})
})
