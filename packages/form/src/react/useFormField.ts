import { useCallback, useEffect, useMemo } from 'react'

import type { InputValue } from '@step-wise/input-interpretation'

import type { FormFieldDefinition, FormFieldId, FormSectionId } from '../fields/index.ts'
import type { FormInputValues } from '../input/index.ts'
import type { FieldValidationState, FormDomainValues } from '../validation/index.ts'

import { useFormStore } from './context.tsx'
import { useFormSnapshot } from './useFormSnapshot.ts'

export type FieldInputStateUpdater<TInputState> = TInputState | ((current: TInputState) => TInputState)

export type FormFieldController<TInputState, TInputValue extends InputValue> = {
	inputState: TInputState
	inputValue: TInputValue
	validationState: FieldValidationState<TInputValue>
	setInputState: (update: FieldInputStateUpdater<TInputState>) => void
	setInputValue: (inputValue: TInputValue) => void
	validate: () => Promise<FieldValidationState<TInputValue>>
}

export type UseFormFieldOptions = {
	sectionId?: FormSectionId
}

// Hook to access a form field's state and operations.
export function useFormField<
	TInputState,
	TInputValue extends InputValue,
	TDomainValue = unknown,
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
>(
	fieldId: FormFieldId,
	definition: FormFieldDefinition<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>,
	{ sectionId }: UseFormFieldOptions = {},
): FormFieldController<TInputState, TInputValue> {
	// Access the form store and snapshot.
	const store = useFormStore<TInputValues, TDomainValues>()
	const snapshot = useFormSnapshot()
	const defaultInputState = useMemo(() => definition.hydrateInput(definition.defaultInputValue), [definition])
	const registered = Object.hasOwn(snapshot.inputValues, fieldId)

	// Register the field with the form store when the component mounts, and unregister it when it unmounts.
	useEffect(() => store.registerField(fieldId, definition, sectionId), [store, fieldId, definition, sectionId])

	// Create callbacks to set the field's input state and input value, and to validate the field.
	const setInputState = useCallback((update: FieldInputStateUpdater<TInputState>) => {
		store.setFieldInputState(fieldId, update as never)
	}, [store, fieldId])
	const setInputValue = useCallback((inputValue: TInputValue) => {
		store.setFieldInputValue(fieldId, inputValue)
	}, [store, fieldId])
	const validate = useCallback(async () => {
		return await store.validateField(fieldId) as FieldValidationState<TInputValue>
	}, [store, fieldId])

	// Return the field's input state, input value, validation state, and the callbacks to set them and validate the field.
	return {
		inputState: registered ? snapshot.inputStates[fieldId] as TInputState : defaultInputState,
		inputValue: registered ? snapshot.inputValues[fieldId] as TInputValue : definition.defaultInputValue,
		validationState: registered ? snapshot.validationStates[fieldId] as FieldValidationState<TInputValue> : { status: 'unvalidated' },
		setInputState,
		setInputValue,
		validate,
	}
}
