import { type ComponentPropsWithoutRef, type PropsWithChildren, type SubmitEvent, useEffect, useRef, useState } from 'react'

import { deepEqual } from '@step-wise/js-utils'
import { useLatestRef } from '@step-wise/react-utils'

import type { FormInputValues, InitialInputUpdatePolicy } from '../input/index.ts'
import type { FormSubmitHandler } from '../submission/index.ts'
import { createFormStore } from '../store/index.ts'
import type { FormDomainValues, InterpretInput } from '../validation/index.ts'

import { FormProvider } from './context.tsx'

export type FormProps<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = PropsWithChildren<Omit<ComponentPropsWithoutRef<'form'>, 'children' | 'onSubmit'> & {
	initialInputValues?: TInputValues
	initialInputUpdatePolicy?: InitialInputUpdatePolicy
	interpretInput: InterpretInput<TInputValues, TDomainValues>
	onSubmit: FormSubmitHandler<TInputValues, TDomainValues, TResult>
}>

// The main form component that provides the form store context and handles form submission.
export function Form<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
>({
	initialInputValues,
	initialInputUpdatePolicy = 'untouched',
	interpretInput,
	onSubmit,
	children,
	...formProps
}: FormProps<TInputValues, TDomainValues, TResult>) {
	// Create refs for the interpretInput and onSubmit functions to ensure they are always up-to-date.
	const interpretInputRef = useLatestRef(interpretInput)
	const onSubmitRef = useLatestRef(onSubmit)

	// Create the form store and manage its lifecycle.
	const [store] = useState(() => createFormStore<TInputValues, TDomainValues, TResult>({
		initialInputValues,
		interpretInput: inputValues => interpretInputRef.current(inputValues),
		onSubmit: submission => onSubmitRef.current(submission),
	}))
	const previousInitialInputValuesRef = useRef(initialInputValues)
	const previousInterpretInputRef = useRef(interpretInput)

	// Update the form store when the initial input values change.
	useEffect(() => {
		if (deepEqual(previousInitialInputValuesRef.current, initialInputValues)) return
		previousInitialInputValuesRef.current = initialInputValues
		store.updateInitialInputValues(initialInputValues ?? {}, initialInputUpdatePolicy)
	}, [store, initialInputValues, initialInputUpdatePolicy])

	// Invalidate the form validation when the interpretInput function changes.
	useEffect(() => {
		if (Object.is(previousInterpretInputRef.current, interpretInput)) return
		previousInterpretInputRef.current = interpretInput
		store.invalidateFormValidation()
	}, [store, interpretInput])

	// Handle form submission by preventing the default behavior and calling the store's submit method.
	const handleSubmit = (event: SubmitEvent<HTMLFormElement>): void => {
		event.preventDefault()
		void store.submit()
	}

	// Render the form provider and the form element, passing along the form props and handling submission.
	return <FormProvider store={store}>
		<form {...formProps} onSubmit={handleSubmit}>
			{children}
		</form>
	</FormProvider>
}
