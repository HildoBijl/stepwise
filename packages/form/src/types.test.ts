import type { InputValue } from '@step-wise/input-interpretation'
import { describe, expectTypeOf, it } from 'vitest'

import type { FormSubmissionResult } from './types.ts'

type IntegerInputValue = InputValue<'Integer', string>
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('submission contracts', () => {
	it('discriminates submission results', () => {
		type Submission = FormSubmissionResult<InputValues, DomainValues, string>

		expectTypeOf<Extract<Submission, { submitted: true }>['result']>().toEqualTypeOf<string>()
	})
})
