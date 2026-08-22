import { describe, expect, it, vi } from 'vitest'

import { skill } from '@step-wise/skill-setup'

import { buildMonoExercise } from './reducer'

const rawInput = (answer: number) => ({ answer: { type: 'Integer', value: `${answer}` } })

function buildExercise(overrides = {}) {
	return buildMonoExercise({
		metaData: { skill: 'main-skill' },
		generateParameters: example => ({ answer: example ? 1 : 2 }),
		checkInput: ({ input, parameters }) => input.answer === parameters.answer,
		...overrides,
	})
}

describe('buildMonoExercise', () => {
	it('builds stored parameters and supplies an empty initial state', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		expect(parameters).toEqual({ answer: 2 })
		expect(exercise.getInitialState(parameters)).toEqual({})
	})

	it('uses empty parameters and state when their generators are omitted', () => {
		const exercise = buildMonoExercise({ metaData: {}, checkInput: () => false })
		const parameters = exercise.generateParameters(false)
		expect(parameters).toEqual({})
		expect(exercise.getInitialState(parameters)).toEqual({})
	})

	it('tracks incorrect solo input and completes on correct input', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		const updateSkills = vi.fn()
		const attempted = exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) }, updateSkills })
		expect(attempted).toEqual({ attempted: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', false, undefined)

		const solved = exercise.processSoloAction({ parameters, state: attempted, action: { type: 'input', input: rawInput(2) }, updateSkills })
		expect(solved).toEqual({ attempted: true, solved: true, done: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', true, undefined)
	})

	it('penalizes an immediate give-up but not one after an attempt', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		const updateSkills = vi.fn()
		exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).toHaveBeenCalledWith('main-skill', false, undefined)

		updateSkills.mockClear()
		exercise.processSoloAction({ parameters, state: { attempted: true }, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).not.toHaveBeenCalled()
	})

	it('tracks group attempts per user and resolves when one answer is correct', () => {
		const exercise = buildExercise()
		const parameters = exercise.generateParameters(false)
		const updateSkills = vi.fn()
		const state = exercise.processGroupActions({ parameters, state: {}, actions: [
			{ userId: 'wrong', action: { type: 'input', input: rawInput(1) } },
			{ userId: 'correct', action: { type: 'input', input: rawInput(2) } },
		], updateSkills })
		expect(state).toEqual({ attemptedBy: ['wrong', 'correct'], solved: true, done: true })
		expect(updateSkills).toHaveBeenCalledWith('main-skill', false, 'wrong')
		expect(updateSkills).toHaveBeenCalledWith('main-skill', true, 'correct')
	})

	it('rejects an empty group action set', () => {
		const exercise = buildExercise()
		expect(() => exercise.processGroupActions({ parameters: exercise.generateParameters(false), state: {}, actions: [] })).toThrow()
	})

	it('updates a configured setup and does nothing when no skill information exists', () => {
		const updateSkills = vi.fn()
		const withSetup = buildExercise({ metaData: { setup: skill('setup-skill') } })
		withSetup.processSoloAction({ parameters: withSetup.generateParameters(false), state: {}, action: { type: 'input', input: rawInput(2) }, updateSkills })
		expect(updateSkills).toHaveBeenCalledWith(expect.objectContaining({ skill: 'setup-skill' }), true, undefined)

		const withoutSetup = buildExercise({ metaData: {} })
		expect(() => withoutSetup.processSoloAction({ parameters: withoutSetup.generateParameters(false), state: {}, action: { type: 'input', input: rawInput(2) } })).not.toThrow()
	})

	it('returns an already completed state unchanged', () => {
		const exercise = buildExercise()
		const state = { done: true } as const
		expect(exercise.processSoloAction({ parameters: exercise.generateParameters(false), state, action: { type: 'input', input: rawInput(2) } })).toBe(state)
	})
})
