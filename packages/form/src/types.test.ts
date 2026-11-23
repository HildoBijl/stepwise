import type { InputValue } from '@step-wise/input-interpretation'
import { describe, expectTypeOf, it } from 'vitest'

import type { FieldValidationData, FormFieldDefinition, FormSubmissionResult, FormValidationResult, InterpretInput } from './types.ts'

type IntegerInputState = { value: string, cursor?: number }
type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('form contracts', () => {
	it('connects a field InputState, InputValue and DomainValue', () => {
		const field = {
			initialInputValue: { type: 'Integer', value: '' },
			normalizeInput: state => ({ type: 'Integer', value: state.value }),
			hydrateInput: value => ({ value: value.value }),
			validate: ({ domainValue }) => ({ valid: domainValue >= 0 }),
		} satisfies FormFieldDefinition<IntegerInputState, IntegerInputValue, number, InputValues, DomainValues>

		expectTypeOf(field.normalizeInput).parameter(0).toEqualTypeOf<IntegerInputState>()
		expectTypeOf(field.hydrateInput).parameter(0).toEqualTypeOf<IntegerInputValue>()
		expectTypeOf(field.validate).parameter(0).toEqualTypeOf<FieldValidationData<IntegerInputState, IntegerInputValue, number, InputValues, DomainValues>>()
	})

	it('types interpretation across a complete form', () => {
		const interpretInput: InterpretInput<InputValues, DomainValues> = inputValues => ({
			answer: Number(inputValues.answer.value),
		})

		expectTypeOf(interpretInput).returns.toEqualTypeOf<DomainValues>()
	})

	it('discriminates validation and submission results', () => {
		type Validation = FormValidationResult<InputValues, DomainValues>
		type Submission = FormSubmissionResult<InputValues, DomainValues, string>

		expectTypeOf<Extract<Validation, { valid: true }>['domainValues']>().toEqualTypeOf<DomainValues>()
		expectTypeOf<Extract<Validation, { valid: false }>['domainValues']>().toEqualTypeOf<Partial<DomainValues>>()
		expectTypeOf<Extract<Submission, { submitted: true }>['result']>().toEqualTypeOf<string>()
	})
})
