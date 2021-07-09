import { isLetter } from 'step-wise/util/strings'

import dot from './dot'
import hat from './hat'

const accents = {
	dot,
	hat,
}
export { accents }

// getFuncs takes a data object and returns an object with all the functions for that data type.
export function getFuncs(data) {
	// Check if functions exist for this data type.
	const funcs = getFuncsOf(data.name)

	// Check if the functions require us to iterate deeper.
	if (funcs.getFuncs)
		return funcs.getFuncs(data)

	// All normal.
	return funcs
}

// getFuncsOf takes a function name and returns the functions for said function.
export function getFuncsOf(name) {
	const funcs = accents[name]
	if (!funcs)
		throw new Error(`Invalid data type: cannot find functions for accent name "${name}".`)
	return funcs
}

export function isAcceptableChar(char) {
	return isLetter(char)
}

export function filterAcceptableChar(str) {
	return str.split('').filter(isAcceptableChar).join('')
}