import { describe, expect, it, vi } from 'vitest'

import { type FieldValidationResult, type FormFieldDefinition, createFieldRegistry } from '../fields/index.ts'
import { type FormInputValues, createInputManager } from '../input/index.ts'

import { createValidationManager } from './validationManager.ts'

type TestInputValue = { type: 'Test', value: string }
type TestInputState = { value: string, cursor?: number }

function createDefinition(options: Partial<FormFieldDefinition<TestInputState, TestInputValue, number>> = {}): FormFieldDefinition<TestInputState, TestInputValue, number> {
	return {
		defaultInputValue: { type: 'Test', value: '1' },
		normalizeInput: state => ({ type: 'Test', value: state.value }),
		hydrateInput: value => ({ value: value.value }),
		getInterpretationErrorFeedback: error => error instanceof Error ? error.message : 'Invalid input.',
		...options,
	}
}

function createSetup({
	definition = createDefinition(),
	interpretInput = vi.fn(inputValues => Object.fromEntries(Object.entries(inputValues).map(([fieldId, inputValue]) => {
		const value = Number((inputValue as TestInputValue).value)
		if (Number.isNaN(value)) throw new Error('Enter a number.')
		return [fieldId, value]
	}))),
}: {
	definition?: FormFieldDefinition<TestInputState, TestInputValue, number>
	interpretInput?: (inputValues: FormInputValues) => Record<string, unknown>
} = {}) {
	const registry = createFieldRegistry()
	registry.registerField('answer', definition, 'main')
	const inputManager = createInputManager({ registry })
	const validationManager = createValidationManager({ registry, inputManager, interpretInput })
	return { registry, inputManager, validationManager, interpretInput }
}

describe('validation manager', () => {
	it('interprets and validates fields while caching results for unchanged InputValues', async () => {
		const validateDomainValue = vi.fn((): FieldValidationResult => ({ valid: true, report: 'accepted' }))
		const { inputManager, validationManager, interpretInput } = createSetup({
			definition: createDefinition({ validateDomainValue }),
		})

		expect(await validationManager.validateField('answer')).toMatchObject({ status: 'valid', report: 'accepted' })
		inputManager.setFieldInputState('answer', { value: '1', cursor: 1 })
		expect(await validationManager.validateField('answer')).toMatchObject({ status: 'valid', report: 'accepted' })
		expect(interpretInput).toHaveBeenCalledTimes(1)
		expect(validateDomainValue).toHaveBeenCalledTimes(1)
	})

	it('turns interpretation errors into field feedback without running domain validation', async () => {
		const validateDomainValue = vi.fn((): FieldValidationResult => ({ valid: true }))
		const { inputManager, validationManager } = createSetup({
			definition: createDefinition({ validateDomainValue }),
		})
		inputManager.setFieldInputValue('answer', { type: 'Test', value: 'not-a-number' })

		expect(await validationManager.validateField('answer')).toEqual({
			status: 'invalid',
			inputValue: { type: 'Test', value: 'not-a-number' },
			feedback: 'Enter a number.',
		})
		expect(validateDomainValue).not.toHaveBeenCalled()
	})

	it('returns semantic validation feedback and interpreted DomainValues for invalid forms', async () => {
		const { inputManager, validationManager } = createSetup({
			definition: createDefinition({
				validateDomainValue: ({ domainValue }) => domainValue > 0
					? { valid: true }
					: { valid: false, feedback: 'Use a positive number.' },
			}),
		})
		inputManager.setFieldInputValue('answer', { type: 'Test', value: '-1' })

		const result = await validationManager.validateForm()
		expect(result).toEqual({
			valid: false,
			invalidFieldIds: ['answer'],
			inputValues: { answer: { type: 'Test', value: '-1' } },
			domainValues: { answer: -1 },
		})
		expect(validationManager.getFieldValidationState('answer')).toMatchObject({
			status: 'invalid',
			feedback: 'Use a positive number.',
		})
	})

	it('validates only fields registered in the requested section', async () => {
		const { registry, inputManager, validationManager } = createSetup()
		registry.registerField('outside', createDefinition(), 'other')
		inputManager.setFieldInputValue('outside', { type: 'Test', value: 'not-a-number' })

		expect(await validationManager.validateSection('main')).toMatchObject({
			valid: true,
			inputValues: { answer: { type: 'Test', value: '1' } },
		})
		expect(await validationManager.validateForm()).toMatchObject({ valid: false, invalidFieldIds: ['outside'] })
	})

	it('aborts and ignores asynchronous validation after invalidation', async () => {
		let resolveValidation!: (result: FieldValidationResult) => void
		let receivedSignal!: AbortSignal
		const { inputManager, validationManager } = createSetup({
			definition: createDefinition({
				validateDomainValue: ({ signal }) => {
					receivedSignal = signal
					return new Promise(resolve => { resolveValidation = resolve })
				},
			}),
		})

		const validation = validationManager.validateField('answer')
		expect(validationManager.getFieldValidationState('answer').status).toBe('validating')
		inputManager.setFieldInputValue('answer', { type: 'Test', value: '2' })
		validationManager.invalidateField('answer')
		expect(receivedSignal.aborted).toBe(true)
		resolveValidation({ valid: true })

		expect(await validation).toEqual({ status: 'unvalidated' })
		expect(validationManager.getFieldValidationState('answer')).toEqual({ status: 'unvalidated' })
	})
})
