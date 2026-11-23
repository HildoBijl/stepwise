import { describe, expect, it, vi } from 'vitest'

import type { FormValidationResult } from '../validation/index.ts'

import { createSubmissionManager } from './submissionManager.ts'

type TestInputValue = { type: 'Test', value: string }
type InputValues = { answer: TestInputValue }
type DomainValues = { answer: number }

const validValidation: FormValidationResult<InputValues, DomainValues> = {
	valid: true,
	inputValues: { answer: { type: 'Test', value: '2' } },
	domainValues: { answer: 2 },
	reports: { answer: 'parsed' },
}

describe('submission manager', () => {
	it('validates and submits InputValues, DomainValues and validation reports', async () => {
		const onSubmit = vi.fn(() => 'saved')
		const manager = createSubmissionManager({ validateForm: () => validValidation, onSubmit })

		await expect(manager.submit()).resolves.toEqual({
			submitted: true,
			submission: {
				inputValues: validValidation.inputValues,
				domainValues: validValidation.domainValues,
				validationReports: validValidation.reports,
			},
			result: 'saved',
		})
		expect(onSubmit).toHaveBeenCalledWith({
			inputValues: validValidation.inputValues,
			domainValues: validValidation.domainValues,
			validationReports: validValidation.reports,
		})
	})

	it('does not submit invalid forms', async () => {
		const validation: FormValidationResult<InputValues, DomainValues> = {
			valid: false,
			invalidFieldIds: ['answer'],
			inputValues: validValidation.inputValues,
			domainValues: {},
		}
		const onSubmit = vi.fn()
		const manager = createSubmissionManager({ validateForm: () => validation, onSubmit })

		await expect(manager.submit()).resolves.toEqual({ submitted: false, reason: 'invalid', validation })
		expect(onSubmit).not.toHaveBeenCalled()
	})

	it('rejects concurrent submissions while the current submission is pending', async () => {
		let resolveSubmission!: (result: string) => void
		const manager = createSubmissionManager({
			validateForm: () => validValidation,
			onSubmit: () => new Promise(resolve => { resolveSubmission = resolve }),
		})

		const firstSubmission = manager.submit()
		expect(manager.getIsSubmitting()).toBe(true)
		await expect(manager.submit()).resolves.toEqual({ submitted: false, reason: 'already-submitting' })
		resolveSubmission('saved')
		await expect(firstSubmission).resolves.toMatchObject({ submitted: true, result: 'saved' })
		expect(manager.getIsSubmitting()).toBe(false)
	})

	it('returns to idle after validation or submission throws', async () => {
		const validationError = new Error('Validation failed unexpectedly.')
		const validationManager = createSubmissionManager({
			validateForm: () => { throw validationError },
			onSubmit: vi.fn(),
		})
		await expect(validationManager.submit()).rejects.toBe(validationError)
		expect(validationManager.getIsSubmitting()).toBe(false)

		const submissionError = new Error('Submission failed unexpectedly.')
		const submissionManager = createSubmissionManager({
			validateForm: () => validValidation,
			onSubmit: () => { throw submissionError },
		})
		await expect(submissionManager.submit()).rejects.toBe(submissionError)
		expect(submissionManager.getIsSubmitting()).toBe(false)
	})
})
