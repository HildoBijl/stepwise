import { JSONstringifyWithoutPropertyQuotes } from 'step-wise/util/strings'
import { setIOtoFO } from 'step-wise/inputTypes'
import { createClient } from '../../client'

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'
const SPECIAL_USER_SURFSUB = '0000000000000000000000000000000000000000'
const SAMPLE_SKILL = 'fillInInteger'

const seed = async db => {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_SURFSUB,
	})
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
	})

	it('gives an error when no exercise is active', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(SPECIAL_USER_SURFSUB)

		const { data, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(inputAction(42))}) {updatedExercise {id}}}` })
		expect(data).toBe(null)
		expect(errors).not.toBeUndefined()
	})

	it('remembers a wrong submission', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(SPECIAL_USER_SURFSUB)

		// Start an exercise.
		const { data: { startExercise: exercise }, errors: startExerciseErrors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active}}` })
		expect(startExerciseErrors).toBeUndefined()
		const state = setIOtoFO(exercise.state)

		// Submit a wrong solution.
		const action = inputAction(state.x + 1)
		const { data: { submitExerciseAction: { updatedExercise } }, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(action)}) {updatedExercise {id exerciseId state active history {action progress}}}}` })
		expect(errors).toBeUndefined()
		expect(updatedExercise).toMatchObject(exercise)
		expect(updatedExercise.history).toHaveLength(1)
		expect(updatedExercise.history[0].progress).toEqual({})
		expect(updatedExercise.history[0].action).toEqual(action)

		// Submit another wrong solution.
		const secondAction = inputAction(state.x + 2)
		const { data: { submitExerciseAction: { updatedExercise: reupdatedExercise } }, errors: secondActionErrors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(secondAction)}) {updatedExercise {history {action progress}}}}` })
		expect(secondActionErrors).toBeUndefined()
		expect(reupdatedExercise.history).toHaveLength(2)
	})

	it('processes a correct solution so a new exercise can be started', async () => {
		const client = await createClient(seed)
		await client.loginSurfConext(SPECIAL_USER_SURFSUB)

		// Start an exercise.
		const { data: { startExercise: exercise }, errors: startExerciseErrors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active}}` })
		expect(startExerciseErrors).toBeUndefined()
		const state = setIOtoFO(exercise.state)

		// Submit a right solution.
		const action = inputAction(state.x)
		const { data: { submitExerciseAction: { updatedExercise } }, errors } = await client.graphql({ query: `mutation{submitExerciseAction(skillId: "${SAMPLE_SKILL}", action: ${JSONstringifyWithoutPropertyQuotes(action)}) {updatedExercise {id exerciseId state active progress history {action progress}}}}` })
		expect(errors).toBeUndefined()
		expect(updatedExercise.active).toBe(false)
		expect(updatedExercise.progress).toMatchObject({ done: true })

		// Check that no exercise is active.
		const { data: { skill: skillAfterSolving }, errors: skillAfterSolvingErrors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId currentExercise {id exerciseId state active}}}` })
		expect(skillAfterSolvingErrors).toBeUndefined()
		expect(skillAfterSolving.currentExercise).toBe(null)

		// Start a new exercise and check that we can start it.
		const { data: { startExercise: secondExercise }, errors: secondExerciseErrors } = await client.graphql({ query: `mutation{startExercise(skillId: "${SAMPLE_SKILL}") {id exerciseId state active}}` })
		expect(errors).toBeUndefined()
		expect(secondExercise).toMatchObject({ active: true })

		// Check that the right exercise is active.
		const { data: { skill: skillAfterRestart }, errors: skillAfterRestartErrors } = await client.graphql({ query: `{skill(skillId: "${SAMPLE_SKILL}") {id skillId currentExercise {id exerciseId state active} exercises {id}}}` })
		expect(skillAfterRestartErrors).toBeUndefined()
		expect(skillAfterRestart.currentExercise).toMatchObject(secondExercise)
		expect(skillAfterRestart.exercises).toHaveLength(2)
	})
})
