import { useFormData } from '../provider'

// useFieldValidation takes a field ID and returns the latest validation data for that field.
export function useFieldValidation(id) {
	const { validation } = useFormData()
	return {
		result: validation.result[id],
		input: validation.input[id],
	}
}
