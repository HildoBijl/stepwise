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
	const funcs = functions[name]
	if (!funcs)
		throw new Error(`Invalid data type: cannot find functions for function name "${name}".`)
	return funcs
}