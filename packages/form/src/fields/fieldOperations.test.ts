import { describe, expect, it } from 'vitest'

import type { FormFieldDefinition } from './types.ts'
import { areFieldInputValuesEqual, hydrateFieldInput, normalizeFieldInput } from './fieldOperations.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string, cursor?: number }

function createDefinition(options: Partial<FormFieldDefinition<TestInputState, TestInputValue>> = {}): FormFieldDefinition<TestInputState, TestInputValue> {
	return {
		defaultInputValue: { type: 'Test', value: '' },
		normalizeInput: state => ({ type: 'Test', value: state.value }),
		hydrateInput: value => ({ value: value.value }),
		...options,
	}
}

describe('field operations', () => {
	it('normalizes InputState and hydrates InputValue through the field definition', () => {
		const definition = createDefinition()

		expect(normalizeFieldInput(definition, { value: 'answer', cursor: 3 })).toEqual({ type: 'Test', value: 'answer' })
		expect(hydrateFieldInput(definition, { type: 'Test', value: 'answer' })).toEqual({ value: 'answer' })
	})

	it('uses custom InputValue equality when provided', () => {
		const definition = createDefinition({
			areInputValuesEqual: (first, second) => first.value.trim() === second.value.trim(),
		})

		expect(areFieldInputValuesEqual(definition, { type: 'Test', value: 'answer' }, { type: 'Test', value: ' answer ' })).toBe(true)
	})

	it('falls back to deep InputValue equality', () => {
		const definition = createDefinition()

		expect(areFieldInputValuesEqual(definition, { type: 'Test', value: 'answer' }, { type: 'Test', value: 'answer' })).toBe(true)
		expect(areFieldInputValuesEqual(definition, { type: 'Test', value: 'answer' }, { type: 'Test', value: 'different' })).toBe(false)
	})
})
