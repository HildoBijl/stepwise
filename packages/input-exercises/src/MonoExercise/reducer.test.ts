import { describe, expect, it, vi } from 'vitest'

import { skill } from '@step-wise/skill-setup'

import { buildMonoExercise } from './reducer.ts'
import type { MonoExerciseSpec } from './types.ts'

const rawInput = (answer: number) => ({ answer: { type: 'Integer', value: `${answer}` } })

function buildExercise(overrides: Partial<MonoExerciseSpec<{ answer: number }, { answer: number }>> = {}) {
	return buildMonoExercise({
		metadata: { skill: 'main-skill' },
		generateParameters: ({ example }) => ({ answer: example ? 1 : 2 }),
		checkInput: ({ input, parameters }) => input.answer === parameters.answer,
		...overrides,
	})
}

describe('buildMonoExercise', () => {
	it('builds stored parameters and supplies an empty initial state', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		expect(parameters).toEqual({ answer: 2 })
		expect(await exercise.getInitialState({ parameters, context: undefined })).toEqual({})
	})

	it('uses empty parameters and state when their generators are omitted', async () => {
		const exercise = buildMonoExercise({ metadata: {}, checkInput: () => false })
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		expect(parameters).toEqual({})
		expect(await exercise.getInitialState({ parameters, context: undefined })).toEqual({})
	})

	it('tracks incorrect solo input and completes on correct input', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		const updateSkills = vi.fn()
		const { state: attempted } = await exercise.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(1) }, updateSkills })
		expect(attempted).toEqual({ attempted: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', false, undefined)

		const { state: solved } = await exercise.processSoloAction({ parameters, context: undefined, state: attempted, action: { type: 'input', input: rawInput(2) }, updateSkills })
		expect(solved).toEqual({ attempted: true, solved: true, done: true })
		expect(updateSkills).toHaveBeenLastCalledWith('main-skill', true, undefined)
	})

	it('penalizes an immediate give-up but not one after an attempt', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		const updateSkills = vi.fn()
		await exercise.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).toHaveBeenCalledWith('main-skill', false, undefined)

		updateSkills.mockClear()
		await exercise.processSoloAction({ parameters, context: undefined, state: { attempted: true }, action: { type: 'giveUp' }, updateSkills })
		expect(updateSkills).not.toHaveBeenCalled()
	})

	it('tracks group attempts per user and resolves when one answer is correct', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		const updateSkills = vi.fn()
		const { state } = await exercise.processGroupActions({ parameters, context: undefined, state: {}, actions: [
			{ userId: 'wrong', action: { type: 'input', input: rawInput(1) } },
			{ userId: 'correct', action: { type: 'input', input: rawInput(2) } },
		], updateSkills })
		expect(state).toEqual({ attemptedBy: ['wrong', 'correct'], solved: true, done: true })
		expect(updateSkills).toHaveBeenCalledWith('main-skill', false, 'wrong')
		expect(updateSkills).toHaveBeenCalledWith('main-skill', true, 'correct')
	})

	it('rejects an empty group action set', async () => {
		const exercise = buildExercise()
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		await expect(exercise.processGroupActions({ parameters, context: undefined, state: {}, actions: [] })).rejects.toThrow()
	})

	it('updates a configured setup and does nothing when no skill information exists', async () => {
		const updateSkills = vi.fn()
		const withSetup = buildExercise({ metadata: { setup: skill('setup-skill') } })
		await withSetup.processSoloAction({ parameters: await withSetup.generateParameters({ example: false, context: undefined }), state: {}, action: { type: 'input', input: rawInput(2) }, context: undefined, updateSkills })
		expect(updateSkills).toHaveBeenCalledWith(expect.objectContaining({ skill: 'setup-skill' }), true, undefined)

		const withoutSetup = buildExercise({ metadata: {} })
		const parameters = await withoutSetup.generateParameters({ example: false, context: undefined })
		expect(() => withoutSetup.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(2) } })).not.toThrow()
	})

	it('returns an already completed state unchanged', async () => {
		const exercise = buildExercise()
		const state = { done: true } as const
		expect((await exercise.processSoloAction({ parameters: await exercise.generateParameters({ example: false, context: undefined }), state, action: { type: 'input', input: rawInput(2) }, context: undefined })).state).toBe(state)
	})

	it('supports asynchronous parameter generators', async () => {
		const exercise = buildExercise({ generateParameters: async () => ({ answer: 3 }) })

		await expect(exercise.generateParameters({ example: false, context: undefined })).resolves.toEqual({ answer: 3 })
	})

	it('passes context through generation, solution resolution, and input checking', async () => {
		type Context = { answer: number }
		const generateParameters = vi.fn(({ context }: { example: boolean, context: Context }) => ({ answer: context.answer }))
		const getStaticSolution = vi.fn(({ context }: { parameters: { answer: number }, context: Context }) => ({ expected: context.answer }))
		const updateInputDependency = vi.fn(({ context }: { context: Context }) => context.answer)
		const getSolution = vi.fn(({ staticSolution, context }: { parameters: { answer: number }, inputDependency: number | undefined, staticSolution: Partial<{ expected: number }>, context: Context }) => ({ expected: staticSolution.expected ?? context.answer }))
		const checkInput = vi.fn(({ input, solution, context }: { input: Record<string, unknown>, solution?: { expected: number }, context: Context }) => solution !== undefined && input.answer === solution.expected && context.answer === solution.expected)
		const exercise = buildMonoExercise<{ answer: number }, { expected: number }, number, Context>({
			metadata: {}, generateParameters, getStaticSolution, updateInputDependency, getSolution, checkInput,
		})
		const context = { answer: 4 }
		const parameters = await exercise.generateParameters({ example: false, context })

		await expect(exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput(4) }, context })).resolves.toMatchObject({ state: { done: true } })
		expect(generateParameters).toHaveBeenCalledWith({ example: false, context })
		expect(getStaticSolution).toHaveBeenCalledWith({ parameters: { answer: 4 }, context })
		expect(updateInputDependency).toHaveBeenCalledWith(expect.objectContaining({ context }))
		expect(getSolution).toHaveBeenCalledWith({ parameters: { answer: 4 }, inputDependency: 4, staticSolution: { expected: 4 }, context })
		expect(checkInput).toHaveBeenCalledWith(expect.objectContaining({ context }))
	})

	it('awaits asynchronous solution generation and input checking', async () => {
		const exercise = buildExercise({
			getSolution: async ({ parameters: { answer } }) => ({ answer }),
			checkInput: async ({ input, solution }) => input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters({ example: false, context: undefined })

		expect((await exercise.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(2) } })).state).toMatchObject({ solved: true, done: true })
	})

	it('returns structured check reports for solo and group reducers', async () => {
		const exercise = buildExercise({ checkInput: ({ input, parameters }) => ({ correct: input.answer === parameters.answer, report: { answer: Number(input.answer) } }) })
		const parameters = await exercise.generateParameters({ example: false, context: undefined })

		await expect(exercise.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(1) } })).resolves.toMatchObject({ report: { answer: 1 } })
		await expect(exercise.processGroupActions({ parameters, context: undefined, state: {}, actions: [
			{ userId: 'one', action: { type: 'input', input: rawInput(1) } },
			{ userId: 'two', action: { type: 'input', input: rawInput(2) } },
		] })).resolves.toMatchObject({ report: { one: { answer: 1 }, two: { answer: 2 } } })
	})

	it('distinguishes an omitted report from an explicit empty report', async () => {
		const parameters = await buildExercise().generateParameters({ example: false, context: undefined })
		const withoutReport = buildExercise({ checkInput: () => ({ correct: false }) })
		const withEmptyReport = buildExercise({ checkInput: () => ({ correct: false, report: {} }) })

		expect(await withoutReport.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(1) } })).not.toHaveProperty('report')
		expect(await withEmptyReport.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(1) } })).toHaveProperty('report', {})
	})

	it('rejects invalid structured check results and reports', async () => {
		const parameters = await buildExercise().generateParameters({ example: false, context: undefined })
		const invalidResult = buildExercise({ checkInput: () => ({ correct: 'yes' }) as never })
		const invalidReport = buildExercise({ checkInput: () => ({ correct: false, report: new Date() }) as never })

		await expect(invalidResult.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(1) } })).rejects.toThrow(/checkInput result/)
		await expect(invalidReport.processSoloAction({ parameters, context: undefined, state: {}, action: { type: 'input', input: rawInput(1) } })).rejects.toThrow(/checkInput report/)
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
			getStaticSolution: ({ parameters: { base } }) => ({ answer: base }),
			getSolution: ({ inputDependency, staticSolution }) => ({ answer: staticSolution.answer! + inputDependency! }),
			checkInput: ({ input, inputDependency, solution }) => inputDependency === 2 && input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		const initialState = await exercise.getInitialState({ parameters, context: undefined })
		expect(initialState).toEqual({})

		const { state } = await exercise.processSoloAction({ parameters, context: undefined, state: initialState, action: { type: 'input', input: { increment: { type: 'Integer', value: '2' }, answer: { type: 'Integer', value: '6' } } } })
		expect(state).toEqual({ inputDependency: 2, attempted: true, solved: true, done: true })
		expect(updateInputDependency).toHaveBeenCalledOnce()
	})

	it('stores separate input dependencies for participants in group mode', async () => {
		const exercise = buildMonoExercise<{}, { answer: number }, number>({
			metadata: {},
			updateInputDependency: ({ previousInputDependency, input }) => (previousInputDependency ?? 0) + Number(input.increment),
			getSolution: ({ inputDependency }) => ({ answer: inputDependency! }),
			checkInput: ({ input, solution }) => input.answer === solution?.answer,
		})
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		const initialState = await exercise.getInitialState({ parameters, context: undefined })
		const { state } = await exercise.processGroupActions({ parameters, context: undefined, state: initialState, actions: [
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
		const parameters = await exercise.generateParameters({ example: false, context: undefined })
		let state = await exercise.getInitialState({ parameters, context: undefined })
		state = (await exercise.processGroupActions({ parameters, context: undefined, state, actions: [{ userId: 'user', action: { type: 'input', input: {} } }] })).state
		expect(state).not.toHaveProperty('inputDependencies')
		state = (await exercise.processGroupActions({ parameters, context: undefined, state, actions: [{ userId: 'user', action: { type: 'input', input: {} } }] })).state
		expect(state).not.toHaveProperty('inputDependencies')
		expect(previousDependencies).toEqual([undefined, undefined])
	})
})
