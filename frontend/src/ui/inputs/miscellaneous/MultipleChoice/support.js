export function getEmptySI(multiple) {
	return { type: 'MultipleChoice', value: multiple ? [] : undefined }
}

export function isEmpty(FO) {
	if (Array.isArray(FO))
		return FO.length === 0 // On multiple inputs.
	return FO === undefined // On single input.
}
