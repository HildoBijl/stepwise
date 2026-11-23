import { describe, expectTypeOf, it } from 'vitest'

import type { FormSubmissionResult, FormSubmitHandler } from './types.ts'

type IntegerInputValue = { type: 'Integer', value: string }
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('submission contracts', () => {
	it('connects submitted InputValues, DomainValues and result types', () => {
		const onSubmit: FormSubmitHandler<InputValues, DomainValues, string> = submission => submission.domainValues.answer.toString()
		type SubmissionResult = FormSubmissionResult<InputValues, DomainValues, string>

		expectTypeOf<ReturnType<typeof onSubmit>>().toEqualTypeOf<string | Promise<string>>()
		expectTypeOf<Extract<SubmissionResult, { submitted: true }>['result']>().toEqualTypeOf<string>()
		expectTypeOf<Extract<SubmissionResult, { submitted: true }>['submission']['inputValues']>().toEqualTypeOf<InputValues>()
	})
})
