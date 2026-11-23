import type { InputValue } from '@step-wise/input-interpretation'
import { describe, expectTypeOf, it } from 'vitest'

import type { FormSubmissionResult, FormSubmitHandler } from './types.ts'

type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('submission contracts', () => {
	it('connects submitted InputValues, DomainValues and result types', () => {
		const onSubmit: FormSubmitHandler<InputValues, DomainValues, string> = submission => submission.domainValues.answer.toString()
		type SubmissionResult = FormSubmissionResult<InputValues, DomainValues, string>

		expectTypeOf(onSubmit).returns.toEqualTypeOf<string | PromiseLike<string>>()
		expectTypeOf<Extract<SubmissionResult, { submitted: true }>['result']>().toEqualTypeOf<string>()
		expectTypeOf<Extract<SubmissionResult, { submitted: true }>['submission']['inputValues']>().toEqualTypeOf<InputValues>()
	})
})
