import frac from './frac'
import subSup from './subSup'
import log from './log'
import sqrt from './sqrt'
import root from './root'

const functions = {
	frac,
	subSup,
	log,
	sqrt,
	root,
}
export { functions }

// getFuncs takes an FI object and returns an object with all the functions for that FI type.
export function getFuncs(FI) {
	// Check if functions exist for this data type.
	const funcs = getFuncsOf(FI.name)

	// Check if the functions require us to iterate deeper.
	if (funcs.getFuncs)
		return funcs.getFuncs(FI)

	// All normal.
	return funcs
}

// getFuncsOf takes a function name and returns the functions for said function.
export function getFuncsOf(FI) {
	const funcs = functions[FI]
	if (!funcs)
		throw new Error(`Invalid FI type: cannot find functions for function name "${FI}".`)
	return funcs
}