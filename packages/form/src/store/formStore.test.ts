import { describe, expect, it, vi } from 'vitest'

import type { FieldValidationResult, FormFieldDefinition } from '../fields/index.ts'

import { createFormStore } from './formStore.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string, cursor?: number }
type InputValues = { answer: TestInputValue }
type DomainValues = { answer: number }

function createDefinition(options: Partial<FormFieldDefinition<TestInputState, TestInputValue, number, InputValues, DomainValues>> = {}): FormFieldDefinition<TestInputState, TestInputValue, number, InputValues, DomainValues> {
	return {
		defaultInputValue: { type: 'Test', value: '1' },
		normalizeInput: state => ({ type: 'Test', value: state.value }),
		hydrateInput: value => ({ value: value.value }),
		...options,
	}
}

function createStore(options: {
	initialInputValues?: InputValues
	onSubmit?: (submission: { domainValues: DomainValues }) => unknown
} = {}) {
	return createFormStore<InputValues, DomainValues, unknown>({
		initialInputValues: options.initialInputValues,
		interpretInput: inputValues => ({ answer: Number(inputValues.answer.value) }),
		onSubmit: options.onSubmit ?? (() => undefined),
	})
}

describe('form store', () => {
	it('initializes registered fields and publishes stable snapshots', () => {
		const store = createStore({ initialInputValues: { answer: { type: 'Test', value: '3' } } })
		const listener = vi.fn()
		store.subscribe(listener)
		const emptySnapshot = store.getSnapshot()
		expect(store.getSnapshot()).toBe(emptySnapshot)

		const unregister = store.registerField('answer', createDefinition(), 'main')
		const registeredSnapshot = store.getSnapshot()
		expect(registeredSnapshot).not.toBe(emptySnapshot)
		expect(registeredSnapshot).toMatchObject({
			fieldIds: ['answer'],
			inputStates: { answer: { value: '3' } },
			inputValues: { answer: { type: 'Test', value: '3' } },
		})
		expect(store.getSnapshot()).toBe(registeredSnapshot)

		unregister()
		expect(store.getSnapshot().fieldIds).toEqual([])
		expect(listener).toHaveBeenCalledTimes(2)
	})

	it('preserves validation for editor-only changes and invalidates it for InputValue changes', async () => {
		const validateDomainValue = vi.fn((): FieldValidationResult => ({ valid: true, report: 'accepted' }))
		const store = createStore()
		store.registerField('answer', createDefinition({ validateDomainValue }))
		await store.validateField('answer')
		expect(store.getSnapshot().validationStates.answer).toMatchObject({ status: 'valid', report: 'accepted' })

		store.setFieldInputState('answer', { value: '1', cursor: 2 })
		expect(store.getSnapshot().validationStates.answer).toMatchObject({ status: 'valid' })
		store.setFieldInputState('answer', { value: '2', cursor: 2 })
		expect(store.getSnapshot().validationStates.answer).toEqual({ status: 'unvalidated' })
	})

	it('publishes validating and completed states for asynchronous validation', async () => {
		let resolveValidation!: (result: FieldValidationResult) => void
		const store = createStore()
		store.registerField('answer', createDefinition({
			validateDomainValue: () => new Promise(resolve => { resolveValidation = resolve }),
		}))

		const validation = store.validateField('answer')
		expect(store.getSnapshot().validationStates.answer?.status).toBe('validating')
		resolveValidation({ valid: true })
		await validation
		expect(store.getSnapshot().validationStates.answer?.status).toBe('valid')
	})

	it('publishes submission state and rejects concurrent submissions', async () => {
		let resolveSubmission!: (result: string) => void
		const store = createStore({
			onSubmit: () => new Promise(resolve => { resolveSubmission = resolve }),
		})
		store.registerField('answer', createDefinition())

		const firstSubmission = store.submit()
		expect(store.getSnapshot().isSubmitting).toBe(true)
		await expect(store.submit()).resolves.toEqual({ submitted: false, reason: 'already-submitting' })
		await Promise.resolve()
		resolveSubmission('saved')
		await expect(firstSubmission).resolves.toMatchObject({ submitted: true, result: 'saved' })
		expect(store.getSnapshot().isSubmitting).toBe(false)
	})
})
