import type { InputValue } from '@step-wise/input-interpretation'

import type { AnyFormFieldDefinition, FormFieldId, FormSectionId } from '../fields/index.ts'
import { createFieldRegistry } from '../fields/index.ts'
import type { FieldInputUpdate, FormInputValues, InitialInputUpdatePolicy, InputStateUpdater } from '../input/index.ts'
import { createInputManager } from '../input/index.ts'
import { createSubmissionManager } from '../submission/index.ts'
import type { FieldValidationState, FormDomainValues, FormValidationResult, InterpretInput } from '../validation/index.ts'
import { createValidationManager } from '../validation/index.ts'

import type { FormStore, FormStoreOptions, FormStoreSnapshot } from './types.ts'

export function createFormStore<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
>({ initialInputValues, interpretInput, onSubmit }: FormStoreOptions<TInputValues, TDomainValues, TResult>): FormStore<TInputValues, TDomainValues, TResult> {
	// Set up the field registry, input manager and validation manager.
	const registry = createFieldRegistry()
	const inputManager = createInputManager({ registry, initialInputValues })
	const validationManager = createValidationManager({ registry, inputManager, interpretInput: interpretInput as InterpretInput })

	/*
	 * Subscription management.
	 */

	// Subscribe a listener to be notified of state changes in the form store. Returns an unsubscribe function to remove the listener.
	const listeners = new Set<() => void>()
	const subscribe = (listener: () => void): (() => void) => {
		listeners.add(listener)
		return () => listeners.delete(listener)
	}

	// Register a field in the form store, initializing its input state and setting up validation. Returns an unregister function to remove the field from the store.
	const registerField: FormStore<TInputValues, TDomainValues, TResult>['registerField'] = (fieldId, definition, sectionId) => {
		// Register the field in the registry, initialize its input state, and emit the state change.
		const unregister = registry.registerField(fieldId, definition as AnyFormFieldDefinition, sectionId)
		inputManager.initializeField(fieldId)
		emit()

		// Return an unregister function.
		let registered = true
		return () => {
			if (!registered) return
			registered = false
			unregister()
			if (!registry.getField(fieldId)) {
				validationManager.invalidateField(fieldId)
				inputManager.removeFieldInput(fieldId)
			}
			emit()
		}
	}

	/*
	 * State management.
	 */

	// Create a snapshot of the current state of the form store, including field IDs, input states, input values, validation states, and submission status. This snapshot is used to provide a consistent view of the form's state to external components.
	const createSnapshot = (): FormStoreSnapshot => {
		const fieldIds = registry.getFieldIds()
		return Object.freeze({
			fieldIds: Object.freeze(fieldIds),
			inputStates: Object.freeze(inputManager.getInputStates()),
			inputValues: Object.freeze(inputManager.getInputValues()),
			validationStates: Object.freeze(Object.fromEntries(fieldIds.map(fieldId => [fieldId, validationManager.getFieldValidationState(fieldId)]))),
			isSubmitting: submissionManager.getIsSubmitting(),
		})
	}

	// Update the snapshot and notify listeners.
	let snapshot: FormStoreSnapshot
	const emit = (): void => {
		snapshot = createSnapshot()
		Array.from(listeners).forEach(listener => listener())
	}

	// Return the current snapshot of the form store, providing a read-only view of the form's state.
	const getSnapshot = (): FormStoreSnapshot => snapshot

	/*
	 * Input modifications.
	 */

	// Internal helper function to apply a single input update.
	const applyInputUpdate = (update: FieldInputUpdate): void => {
		if (update.inputValueChanged) validationManager.invalidateField(update.fieldId)
		if (update.inputStateChanged || update.inputValueChanged) emit()
	}

	// Internal helper function to apply multiple input updates.
	const applyInputUpdates = (updates: FieldInputUpdate[]): void => {
		updates.forEach(update => {
			if (update.inputValueChanged) validationManager.invalidateField(update.fieldId)
		})
		if (updates.some(update => update.inputStateChanged || update.inputValueChanged)) emit()
	}

	// Set the input state or value of a specific field, or set/patch/reset the input values of the form, while managing validation and emitting state changes as necessary.
	const setFieldInputState = (fieldId: FormFieldId, update: InputStateUpdater): void => applyInputUpdate(inputManager.setFieldInputState(fieldId, update))
	const setFieldInputValue = (fieldId: FormFieldId, inputValue: InputValue): void => applyInputUpdate(inputManager.setFieldInputValue(fieldId, inputValue))
	const setInputValues = (inputValues: FormInputValues): void => applyInputUpdates(inputManager.setInputValues(inputValues))
	const patchInputValues = (inputValues: FormInputValues): void => applyInputUpdates(inputManager.patchInputValues(inputValues))
	const resetInputValues = (inputValues?: FormInputValues): void => applyInputUpdates(inputManager.resetInputValues(inputValues))
	const updateInitialInputValues = (inputValues: FormInputValues, policy?: InitialInputUpdatePolicy): void => applyInputUpdates(inputManager.updateInitialInputValues(inputValues, policy))

	/*
	 * Validation operations.
	 */

	// Internal helper function to run a validation operation, emitting state changes before and after the operation to ensure that any changes in validation state are reflected in the form store's snapshot.
	const runValidation = async <T>(validate: () => Promise<T>): Promise<T> => {
		const validation = validate()
		emit()
		try {
			return await validation
		} finally {
			emit()
		}
	}

	// Validate a specific field, a section of fields, or the entire form, while managing validation state and emitting state changes as necessary.
	const validateField = (fieldId: FormFieldId): Promise<FieldValidationState> => runValidation(() => validationManager.validateField(fieldId))
	const validateSection = (sectionId: FormSectionId): Promise<FormValidationResult> => runValidation(() => validationManager.validateSection(sectionId))
	const validateForm = (): Promise<FormValidationResult<TInputValues, TDomainValues>> => runValidation(() => validationManager.validateForm()) as Promise<FormValidationResult<TInputValues, TDomainValues>>

	/*
	 * Submission operations.
	 */

	// Create the submission manager. It's only created now since it needs a validate function.
	const submissionManager = createSubmissionManager({ validateForm, onSubmit })

	// Submit the form through the submission manager.
	const submit: FormStore<TInputValues, TDomainValues, TResult>['submit'] = async () => {
		const submission = submissionManager.submit()
		emit()
		try {
			return await submission
		} finally {
			emit()
		}
	}

	/*
	 * Finalization.
	 */

	// Create the initial snapshot of the form store.
	snapshot = createSnapshot()

	// Return the form store interface with methods for field registration, state management, input modifications, validation operations, and submission operations.
	return {
		registerField,
		getSnapshot,
		subscribe,
		setFieldInputState,
		setFieldInputValue,
		setInputValues,
		patchInputValues,
		resetInputValues,
		updateInitialInputValues,
		validateField,
		validateSection,
		validateForm,
		submit,
	}
}
