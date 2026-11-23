import type { FieldRegistryOptions, FormFieldId, FormFieldRegistry, FormInputValue } from '../fields/index.ts'

/*
 * Form input value and state maps.
 */

export type FormInputValues = Record<FormFieldId, FormInputValue>
export type FormInputStates = Record<FormFieldId, unknown>

/*
 * Field input initialization and updating utilities.
 */

export type FieldInputSnapshot<TInputState = unknown, TInputValue extends FormInputValue = FormInputValue> = {
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
	getFieldInputValue: (fieldId: FormFieldId) => FormInputValue
	getInputStates: (options?: FieldRegistryOptions) => FormInputStates
	getInputValues: (options?: FieldRegistryOptions) => FormInputValues
	setFieldInputState: (fieldId: FormFieldId, update: InputStateUpdater) => FieldInputUpdate
	setFieldInputValue: (fieldId: FormFieldId, inputValue: FormInputValue) => FieldInputUpdate
	setInputValues: (inputValues: FormInputValues) => FieldInputUpdate[]
	patchInputValues: (inputValues: FormInputValues) => FieldInputUpdate[]
	resetInputValues: (inputValues?: FormInputValues) => FieldInputUpdate[]
	updateInitialInputValues: (inputValues: FormInputValues, policy?: InitialInputUpdatePolicy) => FieldInputUpdate[]
}
