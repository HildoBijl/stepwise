import { useInput as useFieldInput } from '../../../../'

import { useInputData } from '../provider'

// useInputId returns the ID of the parent input field.
export function useInputId() {
	return useInputData().id
}

// useInput returns the main value hooks [FI, setFI].
export function useInput() {
	const { FI, setFI } = useInputData()
	return [FI, setFI]
}

export function useInputValue() {
	return useInputFI()
}

export function useInputFI() {
	return useInput()[0]
}

export function useInputFO() {
	const id = useInputId()
	return useFieldInput(id, false)
}

export function useReadOnly() {
	return useInputData().readOnly
}
