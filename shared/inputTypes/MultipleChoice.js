export function isFOofType(param) {
	return false // We never have a MultipleChoice parameter in the state.
}

export function FOtoIO(param) {
	return {
		selection: Array.isArray(param) ? param : [param],
		multiple: Array.isArray(param),
	}
}

export function IOtoFO({ selection, multiple }) {
	return multiple ? [...selection] : selection[0]
}

export function getEmpty(multiple = false) {
	return {
		selection: [],
		multiple,
	}
}

export function isEmpty({ selection }) {
	return selection.length === 0
}

export function equals(a, b) {
	// Check if they are defined.
	if (a === undefined || b === undefined)
		return a === b

	// If defined, compare values.
	return a.multiple === b.multiple && a.selection.length === b.selection.length && a.selection.every(item => b.selection.includes(item))
}
