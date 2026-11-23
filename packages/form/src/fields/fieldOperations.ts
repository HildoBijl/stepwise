import { deepEqual } from '@step-wise/js-utils'
import type { InputValue } from '@step-wise/input-interpretation'

import type { AnyFormFieldDefinition, FormFieldDefinition } from './types.ts'

// Normalize a field's input state to its corresponding input value using the field's definition.
export function normalizeFieldInput<TInputState, TInputValue extends InputValue>(definition: FormFieldDefinition<TInputState, TInputValue>, inputState: TInputState): TInputValue
export function normalizeFieldInput(definition: AnyFormFieldDefinition, inputState: unknown): InputValue
export function normalizeFieldInput(definition: AnyFormFieldDefinition, inputState: unknown): InputValue {
	return definition.normalizeInput(inputState as never)
}

// Hydrate a field's input value to its corresponding input state using the field's definition.
export function hydrateFieldInput<TInputState, TInputValue extends InputValue>(definition: FormFieldDefinition<TInputState, TInputValue>, inputValue: TInputValue): TInputState
export function hydrateFieldInput(definition: AnyFormFieldDefinition, inputValue: InputValue): unknown
export function hydrateFieldInput(definition: AnyFormFieldDefinition, inputValue: InputValue): unknown {
	return definition.hydrateInput(inputValue as never)
}

// Compare two input values for equality using the field's definition.
export function areFieldInputValuesEqual<TInputValue extends InputValue>(definition: FormFieldDefinition<unknown, TInputValue>, first: TInputValue, second: TInputValue): boolean
export function areFieldInputValuesEqual(definition: AnyFormFieldDefinition, first: InputValue, second: InputValue): boolean
export function areFieldInputValuesEqual(definition: AnyFormFieldDefinition, first: InputValue, second: InputValue): boolean {
	return definition.areInputValuesEqual ? definition.areInputValuesEqual(first as never, second as never) : deepEqual(first, second)
}
