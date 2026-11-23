import type { ReactNode } from 'react'

import type { Awaitable } from '@step-wise/js-utils'
import type { InputValue, InputValueMap } from '@step-wise/input-interpretation'

/*
 * Form values.
 */

// Form parts.
export type FormFieldId = string
export type FormSectionId = string

// Form data types.
export type FormInputStates = Record<FormFieldId, unknown>
export type FormInputValues = InputValueMap
export type FormDomainValues = Record<FormFieldId, unknown>

// Form validation.
export type FormValidationReports = Record<FormFieldId, unknown>

// Input state conversion.
export type NormalizeInput<TInputState, TInputValue extends InputValue = InputValue> = (inputState: TInputState) => TInputValue
export type HydrateInput<TInputState, TInputValue extends InputValue = InputValue> = (inputValue: TInputValue) => TInputState

// Form field comparison and interpretation.
export type AreInputValuesEqual<TInputValue extends InputValue = InputValue> = (first: TInputValue, second: TInputValue) => boolean
export type InterpretInput<TInputValues extends FormInputValues = FormInputValues, TDomainValues extends FormDomainValues = FormDomainValues> = (inputValues: TInputValues) => TDomainValues

/*
 * Field definitions.
 */

export type FormFieldDefinition<
	TInputState = unknown,
	TInputValue extends InputValue = InputValue,
	TDomainValue = unknown,
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	initialInputValue: TInputValue
	normalizeInput: NormalizeInput<TInputState, TInputValue>
	hydrateInput: HydrateInput<TInputState, TInputValue>
	areInputValuesEqual?: AreInputValuesEqual<TInputValue>
	getInterpretationErrorFeedback?: (error: unknown) => ReactNode
	validate?: FormFieldValidator<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>
	retainOnUnmount?: boolean
}

/*
 * Validation.
 */

export type FieldValidationData<
	TInputState = unknown,
	TInputValue extends InputValue = InputValue,
	TDomainValue = unknown,
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = {
	fieldId: FormFieldId
	inputState: TInputState
	inputValue: TInputValue
	domainValue: TDomainValue
	inputValues: TInputValues
	domainValues: TDomainValues
	signal: AbortSignal
}

export type FieldValidationResult =
	| { valid: true, report?: unknown }
	| { valid: false, feedback?: ReactNode }

export type FormFieldValidator<
	TInputState = unknown,
	TInputValue extends InputValue = InputValue,
	TDomainValue = unknown,
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = (data: FieldValidationData<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>) => Awaitable<FieldValidationResult>

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

/*
 * Configuration.
 */

export type InitialInputUpdatePolicy = 'untouched' | 'always' | 'never'
