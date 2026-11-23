import type { ReactNode } from 'react'

import type { InputValue } from '@step-wise/input-interpretation'

import { type FieldValidationResult, type FormFieldId, areFieldInputValuesEqual } from '../fields/index.ts'
import type { FormInputValues } from '../input/index.ts'

import type { FieldValidationState, FormDomainValues, FormValidationManager, FormValidationManagerOptions, FormValidationResult } from './types.ts'

// Define types for field value interpretation results.
type ValidInterpretation = { valid: true, inputValue: InputValue, domainValue: unknown }
type InvalidInterpretation = { valid: false, inputValue: InputValue, feedback?: ReactNode }
type Interpretation = ValidInterpretation | InvalidInterpretation

// Define a record type to store the validation state and associated data for each field.
type ValidationRecord = {
	inputValue: InputValue
	state: FieldValidationState
	controller?: AbortController
	promise?: Promise<FieldValidationState>
}

export function createValidationManager({ registry, inputManager, interpretInput }: FormValidationManagerOptions): FormValidationManager {
	// Define maps to store the latest interpretation and validation state for each field.
	const interpretations = new Map<FormFieldId, Interpretation>()
	const validations = new Map<FormFieldId, ValidationRecord>()

	// Retrieve the current validation state of a field, considering its input value and any ongoing validation.
	const getFieldValidationState: FormValidationManager['getFieldValidationState'] = fieldId => {
		const { definition } = registry.requireField(fieldId)
		const inputValue = inputManager.getFieldInputValue(fieldId)
		const validation = validations.get(fieldId)
		if (!validation) return { status: 'unvalidated' }
		if (areFieldInputValuesEqual(definition, validation.inputValue, inputValue)) return validation.state
		validation.controller?.abort()
		validations.delete(fieldId)
		return { status: 'unvalidated' }
	}

	// Invalidate the validation state of a specific field, aborting any ongoing validation and removing its record.
	const invalidateField: FormValidationManager['invalidateField'] = fieldId => {
		validations.get(fieldId)?.controller?.abort()
		validations.delete(fieldId)
		interpretations.delete(fieldId)
	}

	// Invalidate all fields, aborting any ongoing validations and clearing the validation records.
	const invalidateAll: FormValidationManager['invalidateAll'] = () => {
		validations.forEach(validation => validation.controller?.abort())
		validations.clear()
		interpretations.clear()
	}

	// Interpret the input value of a field, caching the result to avoid redundant interpretations for the same input value.
	const interpretField = (fieldId: FormFieldId, inputValue: InputValue): Interpretation => {
		// If the field's input value has already been interpreted and cached, return the cached interpretation.
		const { definition } = registry.requireField(fieldId)
		const cached = interpretations.get(fieldId)
		if (cached && areFieldInputValuesEqual(definition, cached.inputValue, inputValue)) return cached

		// Attempt to interpret the field's input value using the provided interpretInput function, handling any errors that may occur during interpretation.
		let interpretation: Interpretation
		try {
			const domainValues = interpretInput({ [fieldId]: inputValue })
			if (!Object.hasOwn(domainValues, fieldId)) throw new Error(`Input interpretation did not return a DomainValue for form field "${fieldId}".`)
			interpretation = { valid: true, inputValue, domainValue: domainValues[fieldId] }
		} catch (error) {
			interpretation = { valid: false, inputValue, feedback: definition.getInterpretationErrorFeedback?.(error) }
		}
		interpretations.set(fieldId, interpretation)
		return interpretation
	}

	// Internal helper to finalize the validation of a field by checking if the validation is still relevant (i.e., not aborted and still matches the current input value) and updating the validation state accordingly.
	const finishFieldValidation = (fieldId: FormFieldId, record: ValidationRecord, result: FieldValidationResult): FieldValidationState => {
		// If the validation was aborted or the input value has changed since the validation started, return an unvalidated state.
		if (record.controller?.signal.aborted || validations.get(fieldId) !== record) return { status: 'unvalidated' }
		const { definition } = registry.requireField(fieldId)
		const currentInputValue = inputManager.getFieldInputValue(fieldId)
		if (!areFieldInputValuesEqual(definition, record.inputValue, currentInputValue)) {
			validations.delete(fieldId)
			return { status: 'unvalidated' }
		}

		// Update the validation state based on the result of the domain value validation, storing the new state in the validations map.
		const state: FieldValidationState = result.valid
			? { status: 'valid', inputValue: record.inputValue, report: result.report }
			: { status: 'invalid', inputValue: record.inputValue, feedback: result.feedback }
		validations.set(fieldId, { inputValue: record.inputValue, state })
		return state
	}

	// Internal helper to validate a field that has already been successfully interpreted, performing domain value validation if applicable and updating the validation state accordingly.
	const validateInterpretedField = (fieldId: FormFieldId, inputValues: FormInputValues, domainValues: FormDomainValues, interpretation: ValidInterpretation): Promise<FieldValidationState> => {
		// If the field's input value has not changed since the last validation, return the existing validation state or promise if available.
		const { definition } = registry.requireField(fieldId)
		const existing = validations.get(fieldId)
		if (existing && areFieldInputValuesEqual(definition, existing.inputValue, interpretation.inputValue)) {
			if (existing.promise) return existing.promise
			if (existing.state.status === 'valid' || existing.state.status === 'invalid') return Promise.resolve(existing.state)
		}
		existing?.controller?.abort()

		// If the field does not have a domain value validator, mark it as valid and store the validation state without performing any further validation.
		if (!definition.validateDomainValue) {
			const state = { status: 'valid', inputValue: interpretation.inputValue } as const
			validations.set(fieldId, { inputValue: interpretation.inputValue, state })
			return Promise.resolve(state)
		}

		// Run the domain value validator for the field, adding an AbortController signal to allow for cancellation of the validation.
		const controller = new AbortController()
		const validatingState = { status: 'validating', inputValue: interpretation.inputValue } as const
		const record: ValidationRecord = { inputValue: interpretation.inputValue, state: validatingState, controller }
		validations.set(fieldId, record)
		const promise = (async (): Promise<FieldValidationState> => {
			try {
				const result = await definition.validateDomainValue!({
					fieldId,
					inputState: inputManager.getFieldInputState(fieldId),
					inputValue: interpretation.inputValue,
					domainValue: interpretation.domainValue,
					inputValues,
					domainValues,
					signal: controller.signal,
				} as never)
				return finishFieldValidation(fieldId, record, result)
			} catch (error) {
				if (controller.signal.aborted || validations.get(fieldId) !== record) return { status: 'unvalidated' } as const
				validations.delete(fieldId)
				throw error
			}
		})()
		record.promise = promise
		return promise
	}

	// Validate multiple fields by interpreting their input values, performing domain value validation if applicable, and returning a FormValidationResult that summarizes the validation outcomes for all specified fields.
	const validateFields: FormValidationManager['validateFields'] = async fieldIds => {
		// Ensure that each field ID is unique and registered.
		const uniqueFieldIds = [...new Set(fieldIds)]
		uniqueFieldIds.forEach(fieldId => registry.requireField(fieldId))

		// Retrieve the current input values and interpret them to obtain domain values for validation.
		const inputValues = Object.fromEntries(uniqueFieldIds.map(fieldId => [fieldId, inputManager.getFieldInputValue(fieldId)]))
		const interpretationsByField = new Map(uniqueFieldIds.map(fieldId => [fieldId, interpretField(fieldId, inputValues[fieldId])]))
		const domainValues = Object.fromEntries([...interpretationsByField].flatMap(([fieldId, interpretation]) => interpretation.valid ? [[fieldId, interpretation.domainValue]] : []))

		// Validate each field based on its interpretation, either performing domain value validation for valid interpretations or marking the field as invalid for failed interpretations, and collect the resulting validation states.
		const states = await Promise.all(uniqueFieldIds.map(fieldId => {
			const interpretation = interpretationsByField.get(fieldId)!
			if (interpretation.valid) return validateInterpretedField(fieldId, inputValues, domainValues, interpretation)
			validations.get(fieldId)?.controller?.abort()
			const state = { status: 'invalid', inputValue: interpretation.inputValue, feedback: interpretation.feedback } as const
			validations.set(fieldId, { inputValue: interpretation.inputValue, state })
			return state
		}))
		return createFormValidationResult(uniqueFieldIds, inputValues, domainValues, states)
	}

	// Validate a single field.
	const validateField: FormValidationManager['validateField'] = async fieldId => {
		await validateFields([fieldId])
		return getFieldValidationState(fieldId)
	}

	// Validate all fields in a specific section, or in the entire form.
	const validateSection: FormValidationManager['validateSection'] = sectionId => validateFields(registry.getSectionFieldIds(sectionId))
	const validateForm: FormValidationManager['validateForm'] = () => validateFields(registry.getFieldIds())

	// Return the validation manager interface with the defined methods for field validation and state management.
	return {
		getFieldValidationState,
		validateField,
		validateFields,
		validateSection,
		validateForm,
		invalidateField,
		invalidateAll,
	}
}

// Create a FormValidationResult from the provided field IDs, input values, domain values, and validation states.
function createFormValidationResult(
	fieldIds: FormFieldId[],
	inputValues: FormInputValues,
	domainValues: FormDomainValues,
	states: FieldValidationState[],
): FormValidationResult {
	// Identify any fields that are invalid based on their validation states.
	const invalidFieldIds = fieldIds.filter((_, index) => states[index]?.status !== 'valid')
	if (invalidFieldIds.length > 0) return { valid: false, invalidFieldIds, inputValues, domainValues }

	// If all fields are valid, construct a reports object containing any validation reports for the fields.
	const reports = Object.fromEntries(fieldIds.flatMap((fieldId, index) => {
		const state = states[index]
		return state?.status === 'valid' && state.report !== undefined ? [[fieldId, state.report]] : []
	}))
	return { valid: true, inputValues, domainValues, reports }
}
