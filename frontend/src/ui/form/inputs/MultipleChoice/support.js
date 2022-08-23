import { SItoFO } from 'step-wise/inputTypes/MultipleChoice'

export function getEmptySI(multiple) {
	return multiple ? [] : undefined
}

// Input object legacy: in the past the multiple choice input was stored as object. It must be transformed back to make it usable. After old inputs have been removed, this whole thing can be deleted: the default functionalize function is appropriate then.
export function functionalize(data) {
	if (data && data.type === 'MultipleChoice')
		return SItoFO(data.value)
	return data // Regular case.
}

// isEmpty checks if the FO is empty (no options selected).
export function isEmpty(FO) {
	if (Array.isArray(FO))
		return FO.length === 0
	return FO === undefined
}