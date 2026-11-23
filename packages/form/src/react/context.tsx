import { type PropsWithChildren, createContext, useContext } from 'react'

import type { FormInputValues } from '../input/index.ts'
import type { FormDomainValues } from '../validation/index.ts'
import type { FormStore } from '../store/index.ts'

// The context for the form store.
const FormStoreContext = createContext<FormStore | undefined>(undefined)

// The type passed along in the form store context.
export type FormProviderProps<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
> = PropsWithChildren<{
	store: FormStore<TInputValues, TDomainValues, TResult>
}>

// The provider component for the form store context.
export function FormProvider<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
>({ store, children }: FormProviderProps<TInputValues, TDomainValues, TResult>) {
	return <FormStoreContext value={store as unknown as FormStore}>{children}</FormStoreContext>
}

// The main hook to access the form store from the context.
export function useFormStore<
	TInputValues extends FormInputValues = FormInputValues,
	TDomainValues extends FormDomainValues = FormDomainValues,
	TResult = void,
>(): FormStore<TInputValues, TDomainValues, TResult> {
	const store = useContext(FormStoreContext)
	if (!store) throw new Error('useFormStore must be used within a FormProvider.')
	return store as FormStore<TInputValues, TDomainValues, TResult>
}
