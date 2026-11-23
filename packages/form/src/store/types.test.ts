import { describe, expectTypeOf, it } from 'vitest'

import type { FormFieldDefinition } from '../fields/index.ts'

import type { FormStore } from './types.ts'

type IntegerInputValue = { type: 'Integer', value: string }
type InputValues = { answer: IntegerInputValue }
type DomainValues = { answer: number }

describe('form store contracts', () => {
	it('preserves form input, domain and submission result types', () => {
		type Store = FormStore<InputValues, DomainValues, string>
		type Definition = FormFieldDefinition<{ value: string }, IntegerInputValue, number, InputValues, DomainValues>

		expectTypeOf<Store['registerField']>().toBeFunction()
		expectTypeOf<Parameters<NonNullable<Definition['validateDomainValue']>>[0]['domainValues']>().toEqualTypeOf<DomainValues>()
		expectTypeOf<Awaited<ReturnType<Store['submit']>>>().toMatchTypeOf<{ submitted: boolean }>()
	})
})
