import { type AnyFormFieldDefinition, type FormFieldId, type FormInputValue, areFieldInputValuesEqual, hydrateFieldInput, normalizeFieldInput } from '../fields/index.ts'

import type { FieldInputSnapshot, FieldInputUpdate, FormInputManager, FormInputManagerOptions, FormInputValues, InputStateUpdater } from './types.ts'

// Manage editor states and their normalized input values for the fields known to a registry.
export function createInputManager({ registry, initialInputValues = {} }: FormInputManagerOptions): FormInputManager {
	// Initialize the input manager with the provided registry and initial input values.
	let initialValues = { ...initialInputValues }
	let inputValues = { ...initialInputValues }
	const inputStates = new Map<FormFieldId, unknown>()

	// Initialize the input state and value for a field, creating a snapshot of its current state and value.
	const initializeField: FormInputManager['initializeField'] = fieldId => {
		const { definition } = registry.requireField(fieldId)
		if (!Object.hasOwn(inputValues, fieldId)) inputValues[fieldId] = resolveInitialInputValue(fieldId, definition, initialValues)
		if (!inputStates.has(fieldId)) inputStates.set(fieldId, hydrateFieldInput(definition, inputValues[fieldId]))
		return createFieldInputSnapshot(fieldId, inputStates.get(fieldId), inputValues[fieldId])
	}

	// Remove the input state and value for a field, effectively unregistering it from the input manager.
	const removeFieldInput: FormInputManager['removeFieldInput'] = fieldId => {
		inputStates.delete(fieldId)
		delete inputValues[fieldId]
	}

	// Retrieve the current input state and value for a field, initializing it if necessary.
	const getFieldInputState: FormInputManager['getFieldInputState'] = fieldId => initializeField(fieldId).inputState
	const getFieldInputValue: FormInputManager['getFieldInputValue'] = fieldId => initializeField(fieldId).inputValue

	// Retrieve the current input states and values for all fields, optionally including inactive fields.
	const getInputStates: FormInputManager['getInputStates'] = options => Object.fromEntries(registry.getFieldIds(options).map(fieldId => [fieldId, getFieldInputState(fieldId)]))
	const getInputValues: FormInputManager['getInputValues'] = options => Object.fromEntries(registry.getFieldIds(options).map(fieldId => [fieldId, getFieldInputValue(fieldId)]))

	// Update the input state for a field, applying the provided update and returning a snapshot of the changes.
	const setFieldInputState: FormInputManager['setFieldInputState'] = (fieldId, update) => {
		const { definition } = registry.requireField(fieldId)
		const previous = initializeField(fieldId)
		const nextInputState = resolveInputStateUpdate(update, previous.inputState)
		const normalizedInputValue = normalizeFieldInput(definition, nextInputState)
		const inputValueChanged = !areFieldInputValuesEqual(definition, normalizedInputValue, previous.inputValue)
		const nextInputValue = inputValueChanged ? normalizedInputValue : previous.inputValue
		const inputStateChanged = !Object.is(nextInputState, previous.inputState)
		if (inputStateChanged) inputStates.set(fieldId, nextInputState)
		if (inputValueChanged) inputValues[fieldId] = nextInputValue
		return { fieldId, inputStateChanged, inputValueChanged }
	}

	// Internal helper to apply one input value while preserving equal values and any existing editor state.
	const applyFieldInputValue = (fieldId: FormFieldId, nextInputValue: FormInputValue): FieldInputUpdate => {
		// If the input value did not change, return a snapshot indicating no changes to the input state or value.
		const { definition } = registry.requireField(fieldId)
		const previousInputValue = inputValues[fieldId]
		const inputValueChanged = previousInputValue === undefined || !areFieldInputValuesEqual(definition, nextInputValue, previousInputValue)
		if (!inputValueChanged) return { fieldId, inputStateChanged: false, inputValueChanged: false }

		// Update the input value for the field. If there is no existing input state, return a snapshot indicating that the input state did not change.
		inputValues[fieldId] = nextInputValue
		if (!inputStates.has(fieldId)) return { fieldId, inputStateChanged: false, inputValueChanged }

		// Hydrate the input value to the corresponding input state and return a snapshot indicating whether the input state changed.
		const nextInputState = hydrateFieldInput(definition, nextInputValue)
		const inputStateChanged = !Object.is(nextInputState, inputStates.get(fieldId))
		if (inputStateChanged) inputStates.set(fieldId, nextInputState)
		return { fieldId, inputStateChanged, inputValueChanged }
	}

	// Update the input value for a field, hydrating it to the corresponding input state and returning a snapshot of the changes.
	const setFieldInputValue: FormInputManager['setFieldInputValue'] = (fieldId, nextInputValue) => {
		initializeField(fieldId)
		return applyFieldInputValue(fieldId, nextInputValue)
	}

	// Update the input values for multiple fields, applying the provided values and returning snapshots of the changes.
	const setInputValues: FormInputManager['setInputValues'] = nextInputValues => {
		const replacementInputValues = { ...nextInputValues }
		const fieldIds = registry.getFieldIds({ includeInactive: true })
		const updates = fieldIds.map(fieldId => {
			const { definition } = registry.requireField(fieldId)
			const nextInputValue = Object.hasOwn(replacementInputValues, fieldId) ? replacementInputValues[fieldId] : definition.defaultInputValue
			return applyFieldInputValue(fieldId, nextInputValue)
		})

		// Replace pending values for unknown fields while preserving canonical references for known fields.
		inputValues = {
			...replacementInputValues,
			...Object.fromEntries(fieldIds.map(fieldId => [fieldId, inputValues[fieldId]])),
		}
		return updates
	}

	// Patch the input values for multiple fields, merging the provided values with the existing ones and returning snapshots of the changes.
	const patchInputValues: FormInputManager['patchInputValues'] = patchedInputValues => {
		// Apply the provided input values to known fields, returning snapshots of the changes for those fields.
		const fieldIds = registry.getFieldIds({ includeInactive: true })
		const knownFieldIds = new Set(fieldIds)
		const updates = fieldIds
			.filter(fieldId => Object.hasOwn(patchedInputValues, fieldId))
			.map(fieldId => applyFieldInputValue(fieldId, patchedInputValues[fieldId]))

		// Keep values for unknown fields pending until those fields register.
		Object.entries(patchedInputValues).forEach(([fieldId, inputValue]) => {
			if (!knownFieldIds.has(fieldId)) inputValues[fieldId] = inputValue
		})
		return updates
	}

	// Reset the input values to their initial values, optionally updating the initial values and returning snapshots of the changes.
	const resetInputValues: FormInputManager['resetInputValues'] = nextInitialValues => {
		if (nextInitialValues !== undefined) initialValues = { ...nextInitialValues }
		return setInputValues(initialValues)
	}

	// Update the initial input values, applying the provided values and returning snapshots of the changes based on the specified policy.
	const updateInitialInputValues: FormInputManager['updateInitialInputValues'] = (nextInitialValues, policy = 'untouched') => {
		// If the policy is 'never', do not update any initial values or apply them to fields, returning an empty array of updates.
		if (policy === 'never') return []

		// Store the previous initial values and update the initial values to the provided ones, applying them to fields based on the specified policy.
		const previousInitialValues = initialValues
		initialValues = { ...nextInitialValues }
		if (policy === 'always') return setInputValues(initialValues)

		// If the policy is 'untouched', only update fields whose current input values match their previous initial values, returning snapshots of the changes.
		const knownFieldIds = registry.getFieldIds({ includeInactive: true })
		const updates = registry.getFieldIds({ includeInactive: true }).flatMap(fieldId => {
			const { definition } = registry.requireField(fieldId)
			const previousInitialValue = resolveInitialInputValue(fieldId, definition, previousInitialValues)
			const currentInputValue = getFieldInputValue(fieldId)
			if (!areFieldInputValuesEqual(definition, currentInputValue, previousInitialValue)) return []
			const nextInitialValue = resolveInitialInputValue(fieldId, definition, initialValues)
			return [setFieldInputValue(fieldId, nextInitialValue)]
		})

		// Remove any pending values for unknown fields and store the provided initial values for known fields. (But don't add these fields to the updates.)
		const knownFieldIdsSet = new Set(knownFieldIds)
		Object.keys(previousInitialValues).forEach(fieldId => {
			if (!knownFieldIdsSet.has(fieldId)) delete inputValues[fieldId]
		})
		Object.entries(initialValues).forEach(([fieldId, inputValue]) => {
			if (!knownFieldIdsSet.has(fieldId)) inputValues[fieldId] = inputValue
		})
		return updates
	}

	// Return the input manager interface with the defined methods.
	return {
		initializeField,
		removeFieldInput,
		getFieldInputState,
		getFieldInputValue,
		getInputStates,
		getInputValues,
		setFieldInputState,
		setFieldInputValue,
		setInputValues,
		patchInputValues,
		resetInputValues,
		updateInitialInputValues,
	}
}

// Get the initial input value for a field, using the provided initial values or falling back to the field's defined initial value.
function resolveInitialInputValue(fieldId: FormFieldId, definition: AnyFormFieldDefinition, initialInputValues: FormInputValues): FormInputValue {
	return Object.hasOwn(initialInputValues, fieldId) ? initialInputValues[fieldId] : definition.defaultInputValue
}

// Resolve an input state update, which can be a direct value or a function that computes the new state based on the current state.
function resolveInputStateUpdate(update: InputStateUpdater, current: unknown): unknown {
	return typeof update === 'function' ? update(current) : update
}

// Create a snapshot of a field's input state and value for a given field ID.
function createFieldInputSnapshot<TInputState, TInputValue extends FormInputValue>(fieldId: FormFieldId, inputState: TInputState, inputValue: TInputValue): FieldInputSnapshot<TInputState, TInputValue> {
	return { fieldId, inputState, inputValue }
}
