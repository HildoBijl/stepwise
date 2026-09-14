import { describe, expect, it } from 'vitest'

import { getAccumulatedReport, getLastInput, getLastRawInput, hasPreviousInput } from './history.ts'
import { createInputExerciseValueOperations } from './valueOperations.ts'

describe('input-exercise history', () => {
	const exercise = { valueOperations: createInputExerciseValueOperations() }
	const userId = 'user-1'
	const resolvedInput = { answer: { type: 'Text', value: 'resolved' } }
	const pendingInput = { answer: { type: 'Text', value: 'pending' } }

	const history = [
		{ state: {}, actions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
		{ actions: [{ userId, action: { type: 'input', input: pendingInput } }] },
	] as const
	const instance = { mode: 'group', parameters: {}, initialState: {}, history } as const

	it('returns a pending group input when resolved input is not required', () => {
		expect(getLastRawInput(instance, userId)).toBe(pendingInput)
	})

	it('skips a pending event when resolved input is required', () => {
		expect(getLastRawInput(instance, userId, { resolvedOnly: true })).toBe(resolvedInput)
	})

	it('finds and interprets the last solo input while skipping other actions', () => {
		const input = { answer: { type: 'Integer', value: '4' } }
		const soloInstance = {
			mode: 'solo', initialState: {}, history: [
				{ action: { type: 'input', input }, state: {} },
				{ action: { type: 'giveUp' }, state: {} },
			],
		} as const

		expect(getLastRawInput(soloInstance)).toBe(input)
		expect(getLastInput(exercise, soloInstance)).toEqual({ answer: 4 })
		expect(hasPreviousInput(soloInstance)).toBe(true)
	})

	it('returns undefined when a user has no previous input', () => {
		const emptyInstance = { mode: 'solo', initialState: {}, history: [] } as const
		expect(getLastRawInput(emptyInstance)).toBeUndefined()
		expect(getLastInput(exercise, emptyInstance)).toBeUndefined()
		expect(hasPreviousInput(emptyInstance)).toBe(false)
	})

	it('selects the requested group user and requires a userId', () => {
		expect(getLastRawInput(instance, userId)).toBe(pendingInput)
		expect(getLastRawInput(instance, 'other-user')).toBeUndefined()
		expect(() => getLastRawInput(instance)).toThrow(TypeError)
		expect(() => hasPreviousInput(instance)).toThrow(TypeError)
	})

	it('combines reports from resolved solo input events while skipping other actions', () => {
		const soloInstance = {
			mode: 'solo', initialState: {}, history: [
				{ action: { type: 'input', input: resolvedInput }, state: {}, report: { answer: { correct: false }, retained: true } },
				{ action: { type: 'giveUp' }, state: {} },
				{ action: { type: 'input', input: pendingInput }, state: {}, report: { answer: { correct: true } } },
			],
		} as const

		expect(getAccumulatedReport(soloInstance)).toEqual({ answer: { correct: true }, retained: true })
	})

	it('combines reports along an adopted group history branch', () => {
		const groupInstance = {
			mode: 'group', initialState: {}, history: [
				{
					state: {},
					actions: [{ userId: 'source', action: { type: 'input', input: resolvedInput } }],
					report: { source: { first: true, shared: 'source' } },
				},
				{
					state: {},
					actions: [{ userId, action: { type: 'input', input: pendingInput, adoptUserHistory: 'source' } }],
					report: { [userId]: { second: true, shared: 'current' } },
				},
			],
		} as const

		expect(getAccumulatedReport(groupInstance, userId)).toEqual({ first: true, second: true, shared: 'current' })
		expect(() => getAccumulatedReport(groupInstance)).toThrow(TypeError)
	})
})
