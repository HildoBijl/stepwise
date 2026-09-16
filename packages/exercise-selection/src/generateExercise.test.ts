import { describe, expect, it, vi } from 'vitest'

import type { Exercise } from '@step-wise/exercise-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { generateRandomExerciseInstance, generateSkillBasedExerciseInstance } from './generateExercise.ts'

describe('generateRandomExerciseInstance', () => {
	it('creates an instance from generated parameters and initial state', async () => {
		const parameters = { questionCount: 3 }
		const initialState = { questionsRemaining: 3 }
		const generateParameters = vi.fn(() => parameters)
		const getInitialState = vi.fn(({ parameters: receivedParameters }) => receivedParameters === parameters ? initialState : {})
		const exercise = {
			metadata: {},
			generateParameters,
			getInitialState,
			processSoloAction: ({ state }) => ({ state }),
		} satisfies Exercise

		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo', true)).resolves.toEqual({
			exerciseId: 'sample', exerciseVersion: 1, mode: 'solo', parameters, initialState, history: [],
		})
		expect(generateParameters).toHaveBeenCalledWith({ example: true, context: undefined })
		expect(getInitialState).toHaveBeenCalledWith({ parameters, context: undefined })
	})

	it('creates group instances for group-capable exercises', async () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}), processGroupActions: () => ({ state: {} }),
		} satisfies Exercise
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'group')).resolves.toMatchObject({ exerciseId: 'sample', mode: 'group', history: [] })
	})

	it('rejects unsupported modes and invalid example flags', async () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}), processSoloAction: () => ({ state: {} }),
		} satisfies Exercise
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'group')).rejects.toThrow(/mode "group"/)
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo', 'yes' as never)).rejects.toThrow(TypeError)
	})

	it.each([
		['parameters', () => [], () => ({})],
		['initial state', () => ({}), () => []],
	])('rejects non-plain %s', async (_description, generateParameters, getInitialState) => {
		const exercise = { metadata: {}, generateParameters, getInitialState, processSoloAction: () => ({ state: {} }) } as unknown as Exercise
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo')).rejects.toThrow(TypeError)
	})

	it('awaits asynchronous parameter generation and initial-state derivation', async () => {
		const exercise = {
			metadata: {},
			generateParameters: async () => ({ value: 2 }),
			getInitialState: async ({ parameters }) => ({ value: parameters.value }),
			processSoloAction: () => ({ state: {} }),
		} satisfies Exercise

		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo')).resolves.toMatchObject({
			parameters: { value: 2 },
			initialState: { value: 2 },
		})
	})

	it('passes context to parameter and initial-state generation', async () => {
		const context = { moduleId: 'algebra' }
		const generateParameters = vi.fn(({ context }) => ({ moduleId: context.moduleId }))
		const getInitialState = vi.fn(({ context }) => ({ moduleId: context.moduleId }))
		const exercise = {
			metadata: {}, generateParameters, getInitialState, processSoloAction: ({ state }) => ({ state }),
		} satisfies Exercise<any, any, any, any, any, any, typeof context>

		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo', false, context)).resolves.toMatchObject({
			parameters: { moduleId: 'algebra' },
			initialState: { moduleId: 'algebra' },
		})
		expect(generateParameters).toHaveBeenCalledWith({ example: false, context })
		expect(getInitialState).toHaveBeenCalledWith({ parameters: { moduleId: 'algebra' }, context })
	})
})

describe('generateSkillBasedExerciseInstance', () => {
	it('creates a solo instance from the selected exercise', async () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({ value: 2 }), getInitialState: () => ({ done: false }), processSoloAction: () => ({ state: {} }),
		} satisfies Exercise
		const loadSkillLevelSet = vi.fn(async () => ({} as SkillLevelSet))

		await expect(generateSkillBasedExerciseInstance({ sample: exercise }, loadSkillLevelSet)).resolves.toEqual({
			exerciseId: 'sample', exerciseVersion: 1, mode: 'solo', parameters: { value: 2 }, initialState: { done: false }, history: [],
		})
		expect(loadSkillLevelSet).not.toHaveBeenCalled()
	})

	it('stores the selected exercise version', async () => {
		const exercise = {
			metadata: { version: 3 }, generateParameters: () => ({}), getInitialState: () => ({}), processSoloAction: () => ({ state: {} }),
		} satisfies Exercise

		await expect(generateSkillBasedExerciseInstance({ sample: exercise }, async () => ({} as SkillLevelSet))).resolves.toMatchObject({ exerciseVersion: 3 })
	})

	it('passes context to the selected exercise', async () => {
		const context = { moduleId: 'algebra' }
		const generateParameters = vi.fn(({ context }) => ({ moduleId: context.moduleId }))
		const exercise = {
			metadata: {}, generateParameters, getInitialState: () => ({}), processSoloAction: ({ state }) => ({ state }),
		} satisfies Exercise<any, any, any, any, any, any, typeof context>

		await generateSkillBasedExerciseInstance({ sample: exercise }, async () => ({} as SkillLevelSet), [], context)
		expect(generateParameters).toHaveBeenCalledWith({ example: false, context })
	})
})
