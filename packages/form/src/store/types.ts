import type { InputValue } from '@step-wise/input-interpretation'

import type { FormFieldDefinition, FormFieldId, FormSectionId } from '../fields/index.ts'
import type { FormInputStates, FormInputValues, InitialInputUpdatePolicy, InputStateUpdater } from '../input/index.ts'
import type { FieldValidationState, FormDomainValues, FormValidationResult, InterpretInput } from '../validation/index.ts'
import type { FormSubmissionManagerOptions, FormSubmissionResult } from '../submission/index.ts'

/*
 * Form store snapshot type.
 */

export type FormStoreSnapshot = {
	readonly fieldIds: readonly FormFieldId[]
	readonly inputStates: Readonly<FormInputStates>
	readonly inputValues: Readonly<FormInputValues>
	readonly validationStates: Readonly<Record<FormFieldId, FieldValidationState>>
	readonly isSubmitting: boolean
}

/*
 * Form store types.
 */

export type FormStoreOptions<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = Pick<FormSubmissionManagerOptions<TInputValues, TDomainValues, TResult>, 'onSubmit'> & {
	initialInputValues?: TInputValues
	interpretInput: InterpretInput<TInputValues, TDomainValues>
}

export type FormStore<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = {
	registerField: <TInputState, TInputValue extends InputValue, TDomainValue = unknown>(
		fieldId: FormFieldId,
		definition: FormFieldDefinition<TInputState, TInputValue, TDomainValue, TInputValues, TDomainValues>,
		sectionId?: FormSectionId,
	) => () => void
	getSnapshot: () => FormStoreSnapshot
	subscribe: (listener: () => void) => () => void
	setFieldInputState: (fieldId: FormFieldId, update: InputStateUpdater) => void
	setFieldInputValue: (fieldId: FormFieldId, inputValue: InputValue) => void
	setInputValues: (inputValues: FormInputValues) => void
	patchInputValues: (inputValues: FormInputValues) => void
	resetInputValues: (inputValues?: FormInputValues) => void
	updateInitialInputValues: (inputValues: FormInputValues, policy?: InitialInputUpdatePolicy) => void
	validateField: (fieldId: FormFieldId) => Promise<FieldValidationState>
	validateSection: (sectionId: FormSectionId) => Promise<FormValidationResult>
	validateForm: () => Promise<FormValidationResult<TInputValues, TDomainValues>>
	invalidateFormValidation: () => void
	submit: () => Promise<FormSubmissionResult<TInputValues, TDomainValues, TResult>>
}
