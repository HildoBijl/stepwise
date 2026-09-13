import { describe, expect, it, vi } from 'vitest'

import { skill } from '@step-wise/skill-setup'

import { buildMonoExercise } from './reducer.ts'

const rawInput = (answer: number) => ({ answer: { type: 'Integer', value: `${answer}` } })

function buildExercise(overrides = {}) {
	return buildMonoExercise({
		metadata: { skill: 'main-skill' },
		generateParameters: example => ({ answer: example ? 1 : 2 }),
		checkInput: ({ input, parameters }) => input.answer === parameters.answer,
		...overrides,
	})
}

describe('buildMonoExercise', () => {
	it('builds stored parameters and supplies an empty initial state', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		expect(parameters).toEqual({ answer: 2 })
		expect(await exercise.getInitialState(parameters)).toEqual({})
	})

	it('uses empty parameters and state when their generators are omitted', async () => {
		const exercise = buildMonoExercise({ metadata: {}, checkInput: () => false })
		const parameters = await exercise.generateParameters(false)
		expect(parameters).toEqual({})
		expect(await exercise.getInitialState(parameters)).toEqual({})
	})

	it('tracks incorrect solo input and completes on correct input', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		const updateSkills = vi.fn()
		const attempted = await exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) }, updateSkills })
		expect(attempted).toEqual({ attempted: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', false, undefined)

		const solved = await exercise.processSoloAction({ parameters, state: attempted, action: { type: 'input', input: rawInput(2) }, updateSkills })
		expect(solved).toEqual({ attempted: true, solved: true, done: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', true, undefined)
	})

	it('penalizes an immediate give-up but not one after an attempt', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		const updateSkills = vi.fn()
		await exercise.processSoloAction({ parameters, state: {}, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).toHaveBeenCalledWith('main-skill', false, undefined)

		updateSkills.mockClear()
		await exercise.processSoloAction({ parameters, state: { attempted: true }, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).not.toHaveBeenCalled()
	})

	it('tracks group attempts per user and resolves when one answer is correct', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		const updateSkills = vi.fn()
		const state = await exercise.processGroupActions({ parameters, state: {}, actions: [
			{ userId: 'wrong', action: { type: 'input', input: rawInput(1) } },
			{ userId: 'correct', action: { type: 'input', input: rawInput(2) } },
		], updateSkills })
		expect(state).toEqual({ attemptedBy: ['wrong', 'correct'], solved: true, done: true })
		expect(updateSkills).toHaveBeenCalledWith('main-skill', false, 'wrong')
		expect(updateSkills).toHaveBeenCalledWith('main-skill', true, 'correct')
	})

	it('rejects an empty group action set', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters(false)
		await expect(exercise.processGroupActions({ parameters, state: {}, actions: [] })).rejects.toThrow()
	})

	it('updates a configured setup and does nothing when no skill information exists', async () => {
		const updateSkills = vi.fn()
		const withSetup = buildExercise({ metadata: { setup: skill('setup-skill') } })
		await withSetup.processSoloAction({ parameters: await withSetup.generateParameters(false), state: {}, action: { type: 'input', input: rawInput(2) }, updateSkills })
		expect(updateSkills).toHaveBeenCalledWith(expect.objectContaining({ skill: 'setup-skill' }), true, undefined)

		const withoutSetup = buildExercise({ metadata: {} })
		const parameters = await withoutSetup.generateParameters(false)
		expect(() => withoutSetup.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(2) } })).not.toThrow()
	})

	it('returns an already completed state unchanged', async () => {
		const exercise = buildExercise()
		const state = { done: true } as const
		expect(await exercise.processSoloAction({ parameters: await exercise.generateParameters(false), state, action: { type: 'input', input: rawInput(2) } })).toBe(state)
	})

	it('supports asynchronous parameter generators', async () => {
		const exercise = buildExercise({ generateParameters: async () => ({ answer: 3 }) })

		await expect(exercise.generateParameters(false)).resolves.toEqual({ answer: 3 })
	})

	it('awaits asynchronous solution generation and input checking', async () => {
		const exercise = buildExercise({
			getSolution: async ({ answer }) => ({ answer }),
			checkInput: async ({ input, solution }) => input.answer === solution.answer,
		})
		const parameters = await exercise.generateParameters(false)

		expect(await exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(2) } })).toMatchObject({ solved: true, done: true })
	})
})
