import { deepEqual } from '@step-wise/js-utils'

import type { AnyFormFieldDefinition, FormFieldDefinition, FormInputValue } from './types.ts'

// Normalize a field's input state to its corresponding input value using the field's definition.
export function normalizeFieldInput<TInputState, TInputValue extends FormInputValue>(definition: FormFieldDefinition<TInputState, TInputValue>, inputState: TInputState): TInputValue
export function normalizeFieldInput(definition: AnyFormFieldDefinition, inputState: unknown): FormInputValue
export function normalizeFieldInput(definition: AnyFormFieldDefinition, inputState: unknown): FormInputValue {
	return definition.normalizeInput(inputState as never)
}

// Hydrate a field's input value to its corresponding input state using the field's definition.
export function hydrateFieldInput<TInputState, TInputValue extends FormInputValue>(definition: FormFieldDefinition<TInputState, TInputValue>, inputValue: TInputValue): TInputState
export function hydrateFieldInput(definition: AnyFormFieldDefinition, inputValue: FormInputValue): unknown
export function hydrateFieldInput(definition: AnyFormFieldDefinition, inputValue: FormInputValue): unknown {
	return definition.hydrateInput(inputValue as never)
}

// Compare two input values for equality using the field's definition.
export function areFieldInputValuesEqual<TInputValue extends FormInputValue>(definition: FormFieldDefinition<unknown, TInputValue>, first: TInputValue, second: TInputValue): boolean
export function areFieldInputValuesEqual(definition: AnyFormFieldDefinition, first: FormInputValue, second: FormInputValue): boolean
export function areFieldInputValuesEqual(definition: AnyFormFieldDefinition, first: FormInputValue, second: FormInputValue): boolean {
	return definition.areInputValuesEqual ? definition.areInputValuesEqual(first as never, second as never) : deepEqual(first, second)
}
