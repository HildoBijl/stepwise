import type { InputValue } from '@step-wise/input-interpretation'
import { describe, expectTypeOf, it } from 'vitest'

import type { FormSubmissionResult, FormValidationResult, InterpretInput } from './types.ts'

type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('form contracts', () => {
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
