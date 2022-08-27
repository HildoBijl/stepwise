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
	return getFuncsOf(FI.name)
}

// getFuncsOf takes a function name and returns the functions for said function.
export function getFuncsOf(FI) {
	const funcs = functions[FI]
	if (!funcs)
		throw new Error(`Invalid FI type: cannot find functions for function name "${FI}".`)
	return funcs
}
