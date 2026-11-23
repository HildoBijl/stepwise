import type { ReactNode } from 'react'

import type { Awaitable } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'

import type { FormFieldId } from './fields/index.ts'
import type { FormInputValues } from './input/index.ts'

/*
 * Form values.
 */

// Form data types.
export type FormDomainValues = Record<FormFieldId, unknown>

// Form validation.
export type FormValidationReports = Record<FormFieldId, unknown>

// Form field interpretation.
export type InterpretInput<TInputValues extends FormInputValues = FormInputValues, TDomainValues extends FormDomainValues = FormDomainValues> = (inputValues: TInputValues) => TDomainValues

/*
 * Validation.
 */

export type FieldValidationState<TInputValue extends InputValue = InputValue> =
	| { status: 'unvalidated' }
	| { status: 'validating', inputValue: TInputValue }
	| { status: 'valid', inputValue: TInputValue, report?: unknown }
	| { status: 'invalid', inputValue: TInputValue, feedback?: ReactNode }

export type ValidFormValidationResult<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	valid: true
	inputValues: TInputValues
	domainValues: TDomainValues
	reports: FormValidationReports
}

export type InvalidFormValidationResult<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	valid: false
	invalidFieldIds: FormFieldId[]
	inputValues: TInputValues
	domainValues: Partial<TDomainValues>
}

export type FormValidationResult<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = ValidFormValidationResult<TInputValues, TDomainValues> | InvalidFormValidationResult<TInputValues, TDomainValues>

/*
 * Submission.
 */

export type FormSubmission<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	inputValues: TInputValues
	domainValues: TDomainValues
	validationReports: FormValidationReports
}

export type FormSubmitHandler<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = (submission: FormSubmission<TInputValues, TDomainValues>) => Awaitable<TResult>

export type FormSubmissionResult<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> =
	| { submitted: false, reason: 'already-submitting' }
	| { submitted: false, reason: 'invalid', validation: InvalidFormValidationResult<TInputValues, TDomainValues> }
	| { submitted: true, submission: FormSubmission<TInputValues, TDomainValues>, result: TResult }
