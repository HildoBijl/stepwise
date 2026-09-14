import { describe, expect, it, vi } from 'vitest'

import { buildStepExercise } from './reducer.ts'
import { createStepExerciseMetadata } from './preprocessing.ts'
import type { StepExerciseSplitState, StepExerciseSteps } from './types.ts'

const rawInput = (answer: number) => ({ answer: { type: 'Integer', value: `${answer}` } })

function buildExercise(steps: StepExerciseSteps = ['step-one', 'step-two']) {
	return buildStepExercise({
		metadata: createStepExerciseMetadata([...steps]),
		generateParameters: () => ({ answer: 0 }),
		checkInput: ({ input }, step, substep = 0) => input.answer === (substep || step),
	})
}

describe('buildStepExercise', () => {
	it('solves the main problem directly', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		expect(await exercise.getInitialState(parameters)).toEqual({})
		expect((await exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(0) } })).state).toEqual({ attempted: true, solved: true, done: true })
	})

	it('splits on give-up and advances through ordinary steps', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		let { state } = await exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })
		expect(state).toEqual({ split: true, step: 1, 1: {} })

		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(1) } })).state
		expect(state).toMatchObject({ split: true, step: 2, 1: { attempted: true, solved: true, done: true }, 2: {} })

		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(2) } })).state
		expect(state).toMatchObject({ done: true, 2: { attempted: true, solved: true, done: true } })
	})

	it('tracks incorrect attempts at the current step', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		const { state: splitState } = await exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })
		const { state } = await exercise.processSoloAction({ parameters, state: splitState, action: { type: 'input', input: rawInput(9) } })
		expect(state).toMatchObject({ step: 1, 1: { attempted: true } })
	})

	it('solves substeps in sequence without storing attempts per substep', async () => {
		const exercise = buildExercise([['sub-one', 'sub-two']] as const)
		const parameters = await exercise.generateParameters(false)
		let { state } = await exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })
		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(1) } })).state
		expect(state).toMatchObject({ step: 1, 1: { attempted: true, 1: true } })
		expect((state as StepExerciseSplitState)['1']).not.toHaveProperty('2')

		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(2) } })).state
		expect(state).toMatchObject({ done: true, 1: { attempted: true, 1: true, 2: true, solved: true, done: true } })
	})

	it('combines reports from substep checks for each action', async () => {
		const exercise = buildStepExercise({
			metadata: createStepExerciseMetadata([['sub-one', 'sub-two']]),
			checkInput: (_, _step, substep) => ({ correct: true, report: { [`substep${substep}`]: true } }),
		})
		const parameters = await exercise.generateParameters(false)
		const splitState = (await exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })).state

		await expect(exercise.processSoloAction({ parameters, state: splitState, action: { type: 'input', input: {} } })).resolves.toMatchObject({
			report: { substep1: true, substep2: true },
		})
	})

	it('does not penalize giving up at a step after an attempt', async () => {
		const exercise = buildExercise(['step-one'])
		const parameters = await exercise.generateParameters(false)
		const updateSkills = vi.fn()
		let { state } = await exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' }, updateSkills })
		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(9) }, updateSkills })).state
		updateSkills.mockClear()
		await exercise.processSoloAction({ parameters, state, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).not.toHaveBeenCalled()
	})

	it('tracks group attempts per user', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		const { state } = await exercise.processGroupActions({ parameters, state: {}, actions: [
			{ userId: 'one', action: { type: 'input', input: rawInput(9) } },
			{ userId: 'two', action: { type: 'input', input: rawInput(9) } },
		] })
		expect(state).toEqual({ attemptedBy: ['one', 'two'] })
	})

	it('rejects empty group actions and invalid substeps', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		await expect(exercise.processGroupActions({ parameters, state: {}, actions: [] })).rejects.toThrow()
		expect(() => buildExercise([['only-one']] as never)).toThrow()
	})

	it('returns completed state unchanged', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		const state = { done: true } as const
		expect((await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(0) } })).state).toBe(state)
	})
	it('updates dependencies with the current step before checking its solution', async () => {
		const steps: number[] = []
		const exercise = buildStepExercise<{}, { answer: number }, number>({
			metadata: createStepExerciseMetadata(['step-one']),
			updateInputDependency: ({ previousInputDependency, input, step }) => {
				steps.push(step)
				return (previousInputDependency ?? 0) + Number(input.increment)
			},
			getSolution: (_, inputDependency) => ({ answer: inputDependency! }),
			checkInput: ({ input, solution }) => input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters(false)
		let state = await exercise.getInitialState(parameters)
		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'giveUp' } })).state
		state = (await exercise.processSoloAction({ parameters, state, action: { type: 'input', input: { increment: { type: 'Integer', value: '2' }, answer: { type: 'Integer', value: '2' } } } })).state

		expect(steps).toEqual([1])
		expect(state).toMatchObject({ inputDependency: 2, done: true })
	})
})
