import { allFunctions as dot } from './dot'
import { allFunctions as hat } from './hat'

export const accents = {
	dot,
	hat,
}

// getFuncs takes an FI object and returns an object with all the functions for that FI type.
export function getFuncs(FI) {
	return getFuncsOf(FI.name)
}

// getFuncsOf takes a function name and returns the functions for said function.
export function getFuncsOf(FI) {
	const funcs = accents[FI]
	if (!funcs)
		throw new Error(`Invalid FI type: cannot find functions for accent name "${FI}".`)
	return funcs
}
