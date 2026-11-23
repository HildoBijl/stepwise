import type { InputValue } from '@step-wise/input-interpretation'
import { describe, expectTypeOf, it } from 'vitest'

import type { FieldDomainValidationData, FormFieldDefinition } from './types.ts'

type IntegerInputState = { value: string, cursor?: number }
type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('form field contracts', () => {
	it('connects a field InputState, InputValue and DomainValue', () => {
		const field = {
			defaultInputValue: { type: 'Integer', value: '' },
			normalizeInput: state => ({ type: 'Integer', value: state.value }),
			hydrateInput: value => ({ value: value.value }),
			validateDomainValue: ({ domainValue }) => ({ valid: domainValue >= 0 }),
		} satisfies FormFieldDefinition<IntegerInputState, IntegerInputValue, number, InputValues, DomainValues>

		expectTypeOf(field.normalizeInput).parameter(0).toEqualTypeOf<IntegerInputState>()
		expectTypeOf(field.hydrateInput).parameter(0).toEqualTypeOf<IntegerInputValue>()
		expectTypeOf(field.validateDomainValue).parameter(0).toEqualTypeOf<FieldDomainValidationData<IntegerInputState, IntegerInputValue, number, InputValues, DomainValues>>()
	})
})
