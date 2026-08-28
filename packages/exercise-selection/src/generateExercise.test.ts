import type { Exercise } from '@step-wise/exercise-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'
import { describe, expect, it, vi } from 'vitest'

import { generateRandomExerciseInstance, generateSkillBasedExerciseInstance } from './generateExercise.ts'

describe('generateRandomExerciseInstance', () => {
	it('creates an instance from generated parameters and initial state', () => {
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

		expect(generateRandomExerciseInstance({ sample: exercise }, 'solo', true)).toEqual({
			exerciseId: 'sample', mode: 'solo', parameters, initialState, history: [],
		})
		expect(generateParameters).toHaveBeenCalledWith(true)
		expect(getInitialState).toHaveBeenCalledWith(parameters)
	})

	it('creates group instances for group-capable exercises', () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}), processGroupActions: () => ({}),
		} satisfies Exercise
		expect(generateRandomExerciseInstance({ sample: exercise }, 'group')).toMatchObject({ exerciseId: 'sample', mode: 'group', history: [] })
	})

	it('rejects unsupported modes and invalid example flags', () => {
		const exercise = {
			metadata: {}, generateParameters: () => ({}), getInitialState: () => ({}), processSoloAction: () => ({}),
		} satisfies Exercise
		expect(() => generateRandomExerciseInstance({ sample: exercise }, 'group')).toThrow(/mode "group"/)
		expect(() => generateRandomExerciseInstance({ sample: exercise }, 'solo', 'yes' as never)).toThrow(TypeError)
	})

	it.each([
		['parameters', () => [], () => ({})],
		['initial state', () => ({}), () => []],
	])('rejects non-plain %s', (_description, generateParameters, getInitialState) => {
		const exercise = { metadata: {}, generateParameters, getInitialState, processSoloAction: () => ({}) } as unknown as Exercise
		expect(() => generateRandomExerciseInstance({ sample: exercise }, 'solo')).toThrow(TypeError)
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
