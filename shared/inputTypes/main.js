const { isObject, isBasicObject, applyMapping } = require('../util')

const types = [
	'Integer', 'Float', 'Unit', 'FloatUnit', // Number- and physics-based types.
	'Expression', 'Equation', // Expression-based types.
	'Vector', 'Span', // Object-based types.
]

// toFO takes a data object, which may be an SO, and tries to interpret it into functional components. It does so recursively for child parameters. It attempts to find which type it is and use the corresponding SOtoFO function (or SItoFO function if the useSI flag is set to true).
function toFO(data, useSI = false) {
	// Check special cases.
	if (typeof data === 'function')
		throw new Error(`Invalid ${useSI ? 'Input' : 'Storage'} Object: no function is allowed in such objects.`)
	if (typeof data !== 'object')
		return data // Basic type.
	if (data === null)
		return null

	// If the type is known, interpret it.
	const { type, value, settings } = data
	if (types.includes(type)) {
		const funcs = require(`./${type}`)
		const func = funcs[useSI ? 'SItoFO' : 'SOtoFO'] || funcs.SOtoFO
		if (func)
			return func(value, settings)
	}

	// If there is no known type, or the type does not have the appropriate function, walk through the parameters one by one and interpret them.
	return applyMapping(data, data => toFO(data, useSI))
}
module.exports.toFO = toFO

// toSO takes an object and tries to turn all functional objects in it into storage objects.
function toSO(obj, useSI = false, type) {
	// Check special cases.
	if (typeof obj === 'function')
		throw new Error(`Invalid Functional Object: cannot deal with functions.`)

	// Check if some type is known that we can apply, either given or inherent in the given object.
	type = type || obj?.type
	if (type && types.includes(type)) {
		const funcs = require(`./${type}`)
		const func = funcs[useSI ? 'FOtoSI' : 'FOtoSO'] || funcs.FOtoSO
		if (func)
			return { type, value: func(obj) }
	}

	// No type is known. It might be a basic object or array, in which case we process it parameter by parameter.
	if (isBasicObject(obj) || Array.isArray(obj))
		return applyMapping(obj, obj => toSO(obj, useSI))

	// Check other special cases.
	if (typeof obj !== 'object')
		return obj // Basic type.
	if (obj === null)
		return null

	// It's a functional object. Attempt to extract an SO or SI directly from the object.
	const value = obj[useSI ? 'SI' : 'SO'] || obj.SO
	if (value === undefined || (isObject(value) && value.constructor !== Object && !Array.isArray(value)))
		throw new Error(`Invalid data type: received a functional object without a valid SO parameter. Could not turn it into a storage object.`)
	return { type, value }
}
module.exports.toSO = toSO
