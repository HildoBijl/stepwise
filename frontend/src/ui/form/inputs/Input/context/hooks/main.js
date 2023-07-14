import { useInput as useFieldInput } from '../../../'

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

// useInputValue gets the current value of the parent input field. This is the FO, unless the FI is specifically requested by passing 'true'.
export function useInputValue(useFI = false) {
	const id = useInputId()
	return useFieldInput(id, useFI)
}

// useReadOnly gets the current readOnly value.
export function useReadOnly() {
	return useInputData().readOnly
}
