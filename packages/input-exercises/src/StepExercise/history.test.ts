import { describe, expect, it } from 'vitest'

import { createInputExerciseValueOperations } from '../InputExercise/valueOperations.ts'

import { getCurrentStep, getLastInputAtStep, getLastRawInputAtStep, hasPreviousInputAtStep } from './history.ts'

describe('getCurrentStep', () => {
	it('gets the current main problem or step', () => {
		expect(getCurrentStep({})).toBe(0)
		expect(getCurrentStep({ split: true, step: 2, 1: {}, 2: {} })).toBe(2)
	})
})
describe('step-exercise history', () => {
	const exercise = { valueOperations: createInputExerciseValueOperations() }

	it('finds and interprets solo inputs at their respective steps', () => {
		const mainInput = { answer: { type: 'Integer', value: '0' } }
		const stepInput = { answer: { type: 'Integer', value: '1' } }
		const instance = { mode: 'solo', initialState: {}, history: [
			{ action: { type: 'giveUp' }, state: { split: true, step: 1, 1: {} } },
			{ action: { type: 'input', input: stepInput }, state: { split: true, step: 1, 1: {} } },
			{ action: { type: 'input', input: mainInput }, state: { split: true, step: 1, 1: {} } },
		] } as const

		expect(getLastRawInputAtStep(instance, 0)).toBeUndefined()
		expect(getLastRawInputAtStep(instance, 1)).toBe(mainInput)
		expect(getLastInputAtStep(exercise, instance, 1)).toEqual({ answer: 0 })
		expect(hasPreviousInputAtStep(instance, 1)).toBe(true)
	})

	it('skips a pending event when resolved input is required', () => {
		const userId = 'user-1'
		const resolvedInput = { answer: { type: 'Text', value: 'resolved' } }
		const history = [
			{ state: { split: true, step: 1, 1: {} }, actions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
			{ actions: [{ userId, action: { type: 'input', input: { answer: { type: 'Text', value: 'pending' } } } }] },
		] as const
		const instance = { mode: 'group', parameters: {}, initialState: {}, history } as const

		expect(getLastRawInputAtStep(instance, 0, userId, { resolvedOnly: true })).toBe(resolvedInput)
	})

	it('rejects consecutive unresolved group events', () => {
		const userId = 'user-1'
		const input = { answer: { type: 'Text', value: 'pending' } }
		const instance = { mode: 'group', initialState: {}, history: [
			{ actions: [{ userId, action: { type: 'input', input } }] },
			{ actions: [{ userId, action: { type: 'input', input } }] },
		] } as const

		expect(() => getLastRawInputAtStep(instance, 0, userId)).toThrow('preceding event is unresolved')
	})
	it('requires a userId for group histories', () => {
		const instance = { mode: 'group', initialState: {}, history: [] } as const
		expect(() => getLastRawInputAtStep(instance, 0)).toThrow(TypeError)
	})

	it('rejects invalid step numbers', () => {
		const instance = { mode: 'solo', initialState: {}, history: [] } as const
		expect(() => getLastRawInputAtStep(instance, -1)).toThrow()
		expect(() => getLastRawInputAtStep(instance, 1.5)).toThrow()
	})
})