import { deepEqual } from '@step-wise/js-utils'

import type { AnyFormFieldDefinition, FormFieldId, FormFieldRegistry, FormSectionId, RegisteredFormField } from './types.ts'

type MutableRegisteredFormField = Omit<RegisteredFormField, 'registrationCount' | 'sectionRegistrationCounts'> & {
	registrationCount: number
	sectionRegistrationCounts: Map<FormSectionId, number>
}

// Create a registry that tracks field definitions and their active locations in a form.
export function createFieldRegistry(): FormFieldRegistry {
	const fields = new Map<FormFieldId, MutableRegisteredFormField>()

	// Register a field definition for a given field ID and optionally associate it with a section ID.
	const registerField: FormFieldRegistry['registerField'] = (fieldId, definition, sectionId) => {
		// Validate the field ID and check for existing definitions.
		assertValidFieldId(fieldId)
		const existingField = fields.get(fieldId)
		if (existingField && !areFieldDefinitionsCompatible(existingField.definition, definition)) throw new Error(`Cannot register form field "${fieldId}": its definition differs from the definition already registered for this field ID.`)

		// Create a new field entry if it doesn't exist, or use the existing one.
		const field = existingField ?? { fieldId, definition, registrationCount: 0, sectionRegistrationCounts: new Map() }
		if (!existingField) fields.set(fieldId, field)
		field.registrationCount++
		if (sectionId !== undefined) field.sectionRegistrationCounts.set(sectionId, (field.sectionRegistrationCounts.get(sectionId) ?? 0) + 1)

		// Return an unregister function that decrements the registration count and removes the field if necessary.
		let registered = true
		return () => {
			if (!registered) return
			registered = false
			field.registrationCount--
			if (sectionId !== undefined) decrementSectionRegistration(field, sectionId)
			if (field.registrationCount === 0 && !field.definition.retainOnUnmount) fields.delete(fieldId)
		}
	}

	// Retrieve a snapshot of the field definition and its registration counts for a given field ID.
	const getField: FormFieldRegistry['getField'] = fieldId => {
		const field = fields.get(fieldId)
		return field ? createFieldSnapshot(field) : undefined
	}

	// Get a list of field IDs, optionally including inactive fields (those with zero registration count).
	const getFieldIds: FormFieldRegistry['getFieldIds'] = ({ includeInactive = false } = {}) => {
		return [...fields.values()].filter(field => includeInactive || field.registrationCount > 0).map(field => field.fieldId)
	}

	// Get a list of field IDs that are registered in a specific section.
	const getSectionFieldIds: FormFieldRegistry['getSectionFieldIds'] = sectionId => {
		return [...fields.values()].filter(field => (field.sectionRegistrationCounts.get(sectionId) ?? 0) > 0).map(field => field.fieldId)
	}

	// Return the registry interface with the defined methods.
	return { registerField, getField, getFieldIds, getSectionFieldIds }
}

// Validate that a field ID is a non-empty string.
function assertValidFieldId(fieldId: FormFieldId): void {
	if (typeof fieldId !== 'string' || fieldId.length === 0) throw new TypeError('A form field ID must be a non-empty string.')
}

// Check if two field definitions are compatible (i.e., they have the same properties and values).
function areFieldDefinitionsCompatible(first: AnyFormFieldDefinition, second: AnyFormFieldDefinition): boolean {
	return deepEqual(first.initialInputValue, second.initialInputValue)
		&& first.normalizeInput === second.normalizeInput
		&& first.hydrateInput === second.hydrateInput
		&& first.areInputValuesEqual === second.areInputValuesEqual
		&& first.getInterpretationErrorFeedback === second.getInterpretationErrorFeedback
		&& first.validateDomainValue === second.validateDomainValue
		&& first.retainOnUnmount === second.retainOnUnmount
}

// Decrement the registration count for a field in a specific section, removing the section entry if the count reaches zero.
function decrementSectionRegistration(field: MutableRegisteredFormField, sectionId: FormSectionId): void {
	const count = field.sectionRegistrationCounts.get(sectionId)
	if (count === undefined) throw new Error(`Cannot unregister form field "${field.fieldId}" from section "${sectionId}": no matching registration exists.`)
	if (count === 1) field.sectionRegistrationCounts.delete(sectionId)
	else field.sectionRegistrationCounts.set(sectionId, count - 1)
}

// Create a snapshot of a mutable registered field, converting its section registration counts to a read-only map.
function createFieldSnapshot(field: MutableRegisteredFormField): RegisteredFormField {
	return {
		...field,
		sectionRegistrationCounts: new Map(field.sectionRegistrationCounts),
	}
}
