export function getEmptySI(multiple) {
	return multiple ? [] : undefined
}

// isEmpty checks if the FO is empty (no options selected).
export function isEmpty(FO) {
	if (Array.isArray(FO))
		return FO.length === 0
	return FO === undefined
}
