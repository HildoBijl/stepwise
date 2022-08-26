import { isLetter } from 'step-wise/util/strings'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import dot from './dot'
import hat from './hat'

const accents = {
	dot,
	hat,
}
export { accents }

// getFuncs takes an FI object and returns an object with all the functions for that FI type.
export function getFuncs(FI) {
	// Check if functions exist for this FI type.
	const funcs = getFuncsOf(FI.name)

	// Check if the functions require us to iterate deeper.
	if (funcs.getFuncs)
		return funcs.getFuncs(FI)

	// All normal.
	return funcs
}

// getFuncsOf takes a function name and returns the functions for said function.
export function getFuncsOf(FI) {
	const funcs = accents[FI]
	if (!funcs)
		throw new Error(`Invalid FI type: cannot find functions for accent name "${FI}".`)
	return funcs
}

export function isAcceptableChar(key) {
	return isLetter(key) || greekAlphabet[key] !== undefined
}

export function filterAcceptableChar(str) {
	return str.split('').filter(isAcceptableChar).join('')
}