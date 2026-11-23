import type { InputValue } from '@step-wise/input-interpretation'
import { describe, expectTypeOf, it } from 'vitest'

import type { FormValidationResult, InterpretInput } from './types.ts'

type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('validation contracts', () => {
	it('types interpretation across a complete form', () => {
		const interpretInput: InterpretInput<InputValues, DomainValues> = inputValues => ({
			answer: Number(inputValues.answer.value),
		})

		expectTypeOf(interpretInput).returns.toEqualTypeOf<DomainValues>()
	})

	it('discriminates validation results', () => {
		type Validation = FormValidationResult<InputValues, DomainValues>

		expectTypeOf<Extract<Validation, { valid: true }>['domainValues']>().toEqualTypeOf<DomainValues>()
		expectTypeOf<Extract<Validation, { valid: false }>['domainValues']>().toEqualTypeOf<Partial<DomainValues>>()
	})
})
