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
	it('solves the main problem directly', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		expect(exercise.getInitialState(parameters)).toEqual({})
		expect(exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(0) } })).toEqual({ attempted: true, solved: true, done: true })
	})

	it('splits on give-up and advances through ordinary steps', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		let state = exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })
		expect(state).toEqual({ split: true, step: 1, 1: {} })

		state = exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(1) } })
		expect(state).toMatchObject({ split: true, step: 2, 1: { attempted: true, solved: true, done: true }, 2: {} })

		state = exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(2) } })
		expect(state).toMatchObject({ done: true, 2: { attempted: true, solved: true, done: true } })
	})

	it('tracks incorrect attempts at the current step', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		const splitState = exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })
		const state = exercise.processSoloAction({ parameters, state: splitState, action: { type: 'input', input: rawInput(9) } })
		expect(state).toMatchObject({ step: 1, 1: { attempted: true } })
	})

	it('solves substeps in sequence without storing attempts per substep', () => {
		const exercise = buildExercise([['sub-one', 'sub-two']] as const)
		const parameters = exercise.generateParameters(false)
		let state = exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' } })
		state = exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(1) } })
		expect(state).toMatchObject({ step: 1, 1: { attempted: true, 1: true } })
		expect((state as StepExerciseSplitState)['1']).not.toHaveProperty('2')

		state = exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(2) } })
		expect(state).toMatchObject({ done: true, 1: { attempted: true, 1: true, 2: true, solved: true, done: true } })
	})

	it('does not penalize giving up at a step after an attempt', () => {
		const exercise = buildExercise(['step-one'])
		const parameters = exercise.generateParameters(false)
		const updateSkills = vi.fn()
		let state = exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' }, updateSkills })
		state = exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(9) }, updateSkills })
		updateSkills.mockClear()
		exercise.processSoloAction({ parameters, state, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).not.toHaveBeenCalled()
	})

	it('tracks group attempts per user', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		const state = exercise.processGroupActions({ parameters, state: {}, actions: [
			{ userId: 'one', action: { type: 'input', input: rawInput(9) } },
			{ userId: 'two', action: { type: 'input', input: rawInput(9) } },
		] })
		expect(state).toEqual({ attemptedBy: ['one', 'two'] })
	})

	it('rejects empty group actions and invalid substeps', () => {
		const exercise = buildExercise()
		expect(() => exercise.processGroupActions({ parameters: exercise.generateParameters(false), state: {}, actions: [] })).toThrow()
		expect(() => buildExercise([['only-one']] as never)).toThrow()
	})

	it('returns completed state unchanged', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		const state = { done: true } as const
		expect(exercise.processSoloAction({ parameters, state, action: { type: 'input', input: rawInput(0) } })).toBe(state)
	})
})
