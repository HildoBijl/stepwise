import type { InputValue, InputValueMap } from '@step-wise/input-interpretation'

import type { FieldRegistryOptions, FormFieldId, FormFieldRegistry } from '../fields/index.ts'

/*
 * Form input value and state maps.
 */

export type FormInputValues = InputValueMap
export type FormInputStates = Record<FormFieldId, unknown>

/*
 * Field input initialization and updating utilities.
 */

export type FieldInputSnapshot<TInputState = unknown, TInputValue extends InputValue = InputValue> = {
	readonly fieldId: FormFieldId
	readonly inputState: TInputState
	readonly inputValue: TInputValue
}

export type FieldInputUpdate = {
	readonly fieldId: FormFieldId
	readonly inputStateChanged: boolean
	readonly inputValueChanged: boolean
}

export type InitialInputUpdatePolicy = 'untouched' | 'always' | 'never'
export type InputStateUpdater = unknown | ((current: unknown) => unknown)

/*
 * Form input manager.
 */

export type FormInputManagerOptions = {
	registry: FormFieldRegistry
	initialInputValues?: FormInputValues
}

export type FormInputManager = {
	initializeField: (fieldId: FormFieldId) => FieldInputSnapshot
	removeFieldInput: (fieldId: FormFieldId) => void
	getFieldInputState: (fieldId: FormFieldId) => unknown
	getFieldInputValue: (fieldId: FormFieldId) => InputValue
	getInputStates: (options?: FieldRegistryOptions) => FormInputStates
	getInputValues: (options?: FieldRegistryOptions) => FormInputValues
	setFieldInputState: (fieldId: FormFieldId, update: InputStateUpdater) => FieldInputUpdate
	setFieldInputValue: (fieldId: FormFieldId, inputValue: InputValue) => FieldInputUpdate
	setInputValues: (inputValues: FormInputValues) => FieldInputUpdate[]
	patchInputValues: (inputValues: FormInputValues) => FieldInputUpdate[]
	resetInputValues: (inputValues?: FormInputValues) => FieldInputUpdate[]
	updateInitialInputValues: (inputValues: FormInputValues, policy?: InitialInputUpdatePolicy) => FieldInputUpdate[]
}
