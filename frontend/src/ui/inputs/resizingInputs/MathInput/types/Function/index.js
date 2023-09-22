import { allFunctions as frac } from './frac'
import { allFunctions as subSup } from './subSup'
import { allFunctions as log } from './log'
import { allFunctions as sqrt } from './sqrt'
import { allFunctions as root } from './root'

export const functions = {
	frac,
	subSup,
	log,
	sqrt,
	root,
}

// getFuncs takes an FI object and returns an object with all the functions for that FI type.
export function getFuncs(FI) {
	return getFuncsOf(FI.name)
}

// getFuncsOf takes a function name and returns the functions for said function.
export function getFuncsOf(FI) {
	const funcs = functions[FI]
	if (!funcs)
		throw new Error(`Invalid FI type: cannot find functions for function name "${FI}".`)
	return funcs
}
