import { describe, expect, it, vi } from 'vitest'

import type { Exercise } from '@step-wise/exercise-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { generateRandomExerciseInstance, generateSkillBasedExerciseInstance } from './generateExercise.ts'

describe('generateRandomExerciseInstance', () => {
	it('creates an instance from generated parameters and initial state', async () => {
		const parameters = { questionCount: 3 }
		const initialState = { questionsRemaining: 3 }
		const generateParameters = vi.fn(() => parameters)
		const getInitialState = vi.fn(receivedParameters => receivedParameters === parameters ? initialState : {})
		const exercise = {
			metadata: {},
			generateParameters,
			getInitialState,
			processSoloAction: ({ state }) => state,
		} satisfies Exercise

		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo', true)).resolves.toEqual({
			exerciseId: 'sample', mode: 'solo', parameters, initialState, history: [],
		})
		expect(generateParameters).toHaveBeenCalledWith(true)
		expect(getInitialState).toHaveBeenCalledWith(parameters)
	})

	it('creates group instances for group-capable exercises', async () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}), processGroupActions: () => ({}),
		} satisfies Exercise
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'group')).resolves.toMatchObject({ exerciseId: 'sample', mode: 'group', history: [] })
	})

	it('rejects unsupported modes and invalid example flags', async () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}), processSoloAction: () => ({}),
		} satisfies Exercise
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'group')).rejects.toThrow(/mode "group"/)
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo', 'yes' as never)).rejects.toThrow(TypeError)
	})

	it.each([
		['parameters', () => [], () => ({})],
		['initial state', () => ({}), () => []],
	])('rejects non-plain %s', async (_description, generateParameters, getInitialState) => {
		const exercise = { metadata: {}, generateParameters, getInitialState, processSoloAction: () => ({}) } as unknown as Exercise
		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo')).rejects.toThrow(TypeError)
	})

	it('awaits asynchronous parameter generation before deriving initial state', async () => {
		const exercise = {
			metadata: {},
			generateParameters: async () => ({ value: 2 }),
			getInitialState: parameters => ({ value: parameters.value }),
			processSoloAction: () => ({}),
		} satisfies Exercise

		await expect(generateRandomExerciseInstance({ sample: exercise }, 'solo')).resolves.toMatchObject({
			parameters: { value: 2 },
			initialState: { value: 2 },
		})
	})
})

describe('generateSkillBasedExerciseInstance', () => {
	it('creates a solo instance from the selected exercise', async () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({ value: 2 }), getInitialState: () => ({ done: false }), processSoloAction: () => ({}),
		} satisfies Exercise
		const loadSkillLevelSet = vi.fn(async () => ({} as SkillLevelSet))

		await expect(generateSkillBasedExerciseInstance({ sample: exercise }, loadSkillLevelSet)).resolves.toEqual({
			exerciseId: 'sample', mode: 'solo', parameters: { value: 2 }, initialState: { done: false }, history: [],
		})
		expect(loadSkillLevelSet).not.toHaveBeenCalled()
	})
})
