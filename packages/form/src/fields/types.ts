import type { ReactNode } from 'react'

import type { Awaitable } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'

/*
 * Field identity and input conversion.
 */

// Form field and section identifiers.
export type FormFieldId = string
export type FormSectionId = string

// Input conversion functions for form fields.
export type NormalizeInput<TInputState, TInputValue extends InputValue = InputValue> = (inputState: TInputState) => TInputValue
export type HydrateInput<TInputState, TInputValue extends InputValue = InputValue> = (inputValue: TInputValue) => TInputState
export type AreInputValuesEqual<TInputValue extends InputValue = InputValue> = (first: TInputValue, second: TInputValue) => boolean

/*
 * Domain validation contract.
 * A field declares how to validate a DomainValue after the form's interpreter has successfully created it.
 */

export type FieldDomainValidationData<
	TInputState = unknown,
	TInputValue extends InputValue = InputValue,
	TDomainValue = unknown,
	TInputValues extends Record<string, InputValue> = Record<string, InputValue>,
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
	TInputValue extends InputValue = InputValue,
	TDomainValue = unknown,
	TInputValues extends Record<string, InputValue> = Record<string, InputValue>,
	TDomainValues extends Record<string, unknown> = Record<string, unknown>,
> = (data: FieldDomainValidationData<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>) => Awaitable<FieldValidationResult>

/*
 * Full field definition.
 */

export type FormFieldDefinition<
	TInputState = unknown,
	TInputValue extends InputValue = InputValue,
	TDomainValue = unknown,
	TInputValues extends Record<string, InputValue> = Record<string, InputValue>,
	TDomainValues extends Record<string, unknown> = Record<string, unknown>,
> = {
	initialInputValue: TInputValue
	normalizeInput: NormalizeInput<TInputState, TInputValue>
	hydrateInput: HydrateInput<TInputState, TInputValue>
	areInputValuesEqual?: AreInputValuesEqual<TInputValue>
	getInterpretationErrorFeedback?: (error: unknown) => ReactNode
	validateDomainValue?: FormFieldDomainValidator<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>
	retainOnUnmount?: boolean
}

export type AnyFormFieldDefinition = {
	initialInputValue: InputValue
	normalizeInput: (inputState: never) => InputValue
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
	getFieldIds: (options?: FieldRegistryOptions) => FormFieldId[]
	getSectionFieldIds: (sectionId: FormSectionId) => FormFieldId[]
}
