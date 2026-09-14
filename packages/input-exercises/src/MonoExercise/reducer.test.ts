import { describe, expect, it, vi } from 'vitest'

import { skill } from '@step-wise/skill-setup'

import { buildMonoExercise } from './reducer.ts'
import type { MonoExerciseSpec } from './types.ts'

const rawInput = (answer: number) => ({ answer: { type: 'Integer', value: `${answer}` } })

function buildExercise(overrides: Partial<MonoExerciseSpec<{ answer: number }, { answer: number }>> = {}) {
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
		const { state: attempted } = await exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) }, updateSkills })
		expect(attempted).toEqual({ attempted: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', false, undefined)

		const { state: solved } = await exercise.processSoloAction({ parameters, state: attempted, action: { type: 'input', input: rawInput(2) }, updateSkills })
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
		const { state } = await exercise.processGroupActions({ parameters, state: {}, actions: [
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
		expect((await exercise.processSoloAction({ parameters: await exercise.generateParameters(false), state, action: { type: 'input', input: rawInput(2) } })).state).toBe(state)
	})

	it('supports asynchronous parameter generators', async () => {
		const exercise = buildExercise({ generateParameters: async () => ({ answer: 3 }) })

		await expect(exercise.generateParameters(false)).resolves.toEqual({ answer: 3 })
	})

	it('awaits asynchronous solution generation and input checking', async () => {
		const exercise = buildExercise({
			getSolution: async ({ answer }) => ({ answer }),
			checkInput: async ({ input, solution }) => input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters(false)

		expect((await exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(2) } })).state).toMatchObject({ solved: true, done: true })
	})

	it('returns structured check reports for solo and group reducers', async () => {
		const exercise = buildExercise({ checkInput: ({ input, parameters }) => ({ correct: input.answer === parameters.answer, report: { answer: input.answer } }) })
		const parameters = await exercise.generateParameters(false)

		await expect(exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) } })).resolves.toMatchObject({ report: { answer: 1 } })
		await expect(exercise.processGroupActions({ parameters, state: {}, actions: [
			{ userId: 'one', action: { type: 'input', input: rawInput(1) } },
			{ userId: 'two', action: { type: 'input', input: rawInput(2) } },
		] })).resolves.toMatchObject({ report: { one: { answer: 1 }, two: { answer: 2 } } })
	})

	it('distinguishes an omitted report from an explicit empty report', async () => {
		const parameters = await buildExercise().generateParameters(false)
		const withoutReport = buildExercise({ checkInput: () => ({ correct: false }) })
		const withEmptyReport = buildExercise({ checkInput: () => ({ correct: false, report: {} }) })

		expect(await withoutReport.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) } })).not.toHaveProperty('report')
		expect(await withEmptyReport.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) } })).toHaveProperty('report', {})
	})

	it('rejects invalid structured check results and reports', async () => {
		const parameters = await buildExercise().generateParameters(false)
		const invalidResult = buildExercise({ checkInput: () => ({ correct: 'yes' }) as never })
		const invalidReport = buildExercise({ checkInput: () => ({ correct: false, report: new Date() }) as never })

		await expect(invalidResult.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) } })).rejects.toThrow(/checkInput result/)
		await expect(invalidReport.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(1) } })).rejects.toThrow(/checkInput report/)
	})

	it('updates an input dependency before generating and checking the solution', async () => {
		const updateInputDependency = vi.fn(({ previousInputDependency, input, step }) => {
			expect(step).toBe(0)
			return Number(previousInputDependency ?? 0) + Number(input.increment)
		})
		const exercise = buildMonoExercise<{ base: number }, { answer: number }, number>({
			metadata: {},
			generateParameters: () => ({ base: 4 }),
			updateInputDependency,
			getStaticSolution: ({ base }) => ({ answer: base }),
			getSolution: (_, inputDependency, staticSolution) => ({ answer: staticSolution.answer! + inputDependency! }),
			checkInput: ({ input, solution }) => input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters(false)
		const initialState = await exercise.getInitialState(parameters)
		expect(initialState).toEqual({})

		const { state } = await exercise.processSoloAction({ parameters, state: initialState, action: { type: 'input', input: { increment: { type: 'Integer', value: '2' }, answer: { type: 'Integer', value: '6' } } } })
		expect(state).toEqual({ inputDependency: 2, attempted: true, solved: true, done: true })
		expect(updateInputDependency).toHaveBeenCalledOnce()
	})

	it('stores separate input dependencies for participants in group mode', async () => {
		const exercise = buildMonoExercise<{}, { answer: number }, number>({
			metadata: {},
			updateInputDependency: ({ previousInputDependency, input }) => (previousInputDependency ?? 0) + Number(input.increment),
			getSolution: (_, inputDependency) => ({ answer: inputDependency! }),
			checkInput: ({ input, solution }) => input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters(false)
		const initialState = await exercise.getInitialState(parameters)
		const { state } = await exercise.processGroupActions({ parameters, state: initialState, actions: [
			{ userId: 'one', action: { type: 'input', input: { increment: { type: 'Integer', value: '1' }, answer: { type: 'Integer', value: '0' } } } },
			{ userId: 'two', action: { type: 'input', input: { increment: { type: 'Integer', value: '2' }, answer: { type: 'Integer', value: '0' } } } },
		] })
		expect(state).toMatchObject({ inputDependencies: { one: 1, two: 2 } })
	})
	it('removes undefined group dependencies', async () => {
		const previousDependencies: (number | undefined)[] = []
		const exercise = buildMonoExercise<{}, {}, number>({
			metadata: {},
			updateInputDependency: ({ previousInputDependency }) => {
				previousDependencies.push(previousInputDependency)
				return undefined
			},
			getSolution: () => ({}),
			checkInput: () => false,
		})
		const parameters = await exercise.generateParameters(false)
		let state = await exercise.getInitialState(parameters)
		state = (await exercise.processGroupActions({ parameters, state, actions: [{ userId: 'user', action: { type: 'input', input: {} } }] })).state
		expect(state).not.toHaveProperty('inputDependencies')
		state = (await exercise.processGroupActions({ parameters, state, actions: [{ userId: 'user', action: { type: 'input', input: {} } }] })).state
		expect(state).not.toHaveProperty('inputDependencies')
		expect(previousDependencies).toEqual([undefined, undefined])
	})
})
