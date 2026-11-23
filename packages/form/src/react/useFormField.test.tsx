import type { PropsWithChildren } from 'react'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { FormFieldDefinition } from '../fields/index.ts'
import { createFormStore } from '../store/index.ts'

import { FormProvider } from './context.tsx'
import { useFormField } from './useFormField.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string, cursor?: number }
type InputValues = { answer: TestInputValue }
type DomainValues = { answer: number }

const definition: FormFieldDefinition<TestInputState, TestInputValue, number, InputValues, DomainValues> = {
	defaultInputValue: { type: 'Test', value: '1' },
	normalizeInput: state => ({ type: 'Test', value: state.value }),
	hydrateInput: value => ({ value: value.value }),
	validateDomainValue: ({ domainValue }) => domainValue > 0
		? { valid: true, report: 'positive' }
		: { valid: false, feedback: 'Enter a positive number.' },
}

function createStore() {
	return createFormStore<InputValues, DomainValues>({
		initialInputValues: { answer: { type: 'Test', value: '2' } },
		interpretInput: inputValues => ({ answer: Number(inputValues.answer.value) }),
		onSubmit: () => undefined,
	})
}

describe('useFormField', () => {
	it('registers, updates, validates and unregisters a typed field', async () => {
		const store = createStore()
		const wrapper = ({ children }: PropsWithChildren) => <FormProvider store={store}>{children}</FormProvider>
		const { result, unmount } = renderHook(() => useFormField('answer', definition, { sectionId: 'main' }), { wrapper })

		expect(result.current.inputState).toEqual({ value: '2' })
		expect(result.current.inputValue).toEqual({ type: 'Test', value: '2' })

		act(() => result.current.setInputState({ value: '3', cursor: 1 }))
		expect(result.current.inputState).toEqual({ value: '3', cursor: 1 })
		expect(result.current.inputValue).toEqual({ type: 'Test', value: '3' })

		await act(async () => { await result.current.validate() })
		expect(result.current.validationState).toMatchObject({ status: 'valid', report: 'positive' })

		unmount()
		expect(store.getSnapshot().fieldIds).toEqual([])
	})
})
