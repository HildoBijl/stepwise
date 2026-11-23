import type { ReactNode } from 'react'

import type { Awaitable, PlainDataValue } from '@step-wise/js-utils'

/*
 * Field identity and input conversion.
 */

// Fundamental form types.
export type FormFieldId = string
export type FormSectionId = string
export type FormInputValue = PlainDataValue

// Input conversion functions for form fields.
export type NormalizeInput<TInputState, TInputValue extends FormInputValue = FormInputValue> = (inputState: TInputState) => TInputValue
export type HydrateInput<TInputState, TInputValue extends FormInputValue = FormInputValue> = (inputValue: TInputValue) => TInputState
export type AreInputValuesEqual<TInputValue extends FormInputValue = FormInputValue> = (first: TInputValue, second: TInputValue) => boolean

/*
 * Domain validation contract.
 * A field declares how to validate a DomainValue after the form's interpreter has successfully created it.
 */

export type FieldDomainValidationData<
	TInputState = unknown,
	TInputValue extends FormInputValue = FormInputValue,
	TDomainValue = unknown,
	TInputValues extends Record<string, FormInputValue> = Record<string, FormInputValue>,
	TDomainValues extends Record<string, unknown> = Record<string, unknown>,
> = {
	fieldId: FormFieldId
	inputState: TInputState
	inputValue: TInputValue
	domainValue: TDomainValue
	inputValues: TInputValues
	domainValues: TDomainValues
	signal: AbortSignal
}

export type FieldValidationResult = { valid: true, report?: unknown } | { valid: false, feedback?: ReactNode }

export type FormFieldDomainValidator<
	TInputState = unknown,
	TInputValue extends FormInputValue = FormInputValue,
	TDomainValue = unknown,
	TInputValues extends Record<string, FormInputValue> = Record<string, FormInputValue>,
	TDomainValues extends Record<string, unknown> = Record<string, unknown>,
> = (data: FieldDomainValidationData<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>) => Awaitable<FieldValidationResult>

/*
 * Full field definition.
 */

export type FormFieldDefinition<
	TInputState = unknown,
	TInputValue extends FormInputValue = FormInputValue,
	TDomainValue = unknown,
	TInputValues extends Record<string, FormInputValue> = Record<string, FormInputValue>,
	TDomainValues extends Record<string, unknown> = Record<string, unknown>,
> = {
	defaultInputValue: TInputValue
	normalizeInput: NormalizeInput<TInputState, TInputValue>
	hydrateInput: HydrateInput<TInputState, TInputValue>
	areInputValuesEqual?: AreInputValuesEqual<TInputValue>
	getInterpretationErrorFeedback?: (error: unknown) => ReactNode
	validateDomainValue?: FormFieldDomainValidator<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>
	retainOnUnmount?: boolean
}

export type AnyFormFieldDefinition = {
	defaultInputValue: FormInputValue
	normalizeInput: (inputState: never) => FormInputValue
	hydrateInput: (inputValue: never) => unknown
	areInputValuesEqual?: (first: never, second: never) => boolean
	getInterpretationErrorFeedback?: (error: unknown) => ReactNode
	validateDomainValue?: (data: never) => Awaitable<FieldValidationResult>
	retainOnUnmount?: boolean
}

/*
 * Field registry.
 */

export type RegisteredFormField = {
	readonly fieldId: FormFieldId
	readonly definition: AnyFormFieldDefinition
	readonly registrationCount: number
	readonly sectionRegistrationCounts: ReadonlyMap<FormSectionId, number>
}

export type FieldRegistryOptions = {
	includeInactive?: boolean
}

export type FormFieldRegistry = {
	registerField: (fieldId: FormFieldId, definition: AnyFormFieldDefinition, sectionId?: FormSectionId) => () => void
	getField: (fieldId: FormFieldId) => RegisteredFormField | undefined
	requireField: (fieldId: FormFieldId) => RegisteredFormField
	getFieldIds: (options?: FieldRegistryOptions) => FormFieldId[]
	getSectionFieldIds: (sectionId: FormSectionId) => FormFieldId[]
}
