import type { ReactNode } from 'react'

import type { InputValue } from '@step-wise/input-interpretation'

import type { FormFieldId, FormFieldRegistry, FormSectionId } from '../fields/index.ts'
import type { FormInputManager, FormInputValues } from '../input/index.ts'

/*
 * Fundamental validation types.
 */

export type FormDomainValues = Record<FormFieldId, unknown>

export type InterpretInput<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
> = (inputValues: TInputValues) => TDomainValues

export type FieldValidationState<TInputValue extends InputValue = InputValue> =
	| { status: 'unvalidated' }
	| { status: 'validating', inputValue: TInputValue }
	| { status: 'valid', inputValue: TInputValue, report?: unknown }
	| { status: 'invalid', inputValue: TInputValue, feedback?: ReactNode }

/*
 * Form validation result types.
 */

export type FormValidationReports = Partial<Record<FormFieldId, unknown>>

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
 * Form validation manager.
 */

export type FormValidationManagerOptions = {
	registry: FormFieldRegistry
	inputManager: FormInputManager
	interpretInput: InterpretInput
}

export type FormValidationManager = {
	getFieldValidationState: (fieldId: FormFieldId) => FieldValidationState
	validateField: (fieldId: FormFieldId) => Promise<FieldValidationState>
	validateFields: (fieldIds: readonly FormFieldId[]) => Promise<FormValidationResult>
	validateSection: (sectionId: FormSectionId) => Promise<FormValidationResult>
	validateForm: () => Promise<FormValidationResult>
	invalidateField: (fieldId: FormFieldId) => void
	invalidateAll: () => void
}
