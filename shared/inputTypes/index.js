const { isObject, isBasicObject, applyToEachParameter, deepEquals } = require('../util/objects')

// Input object legacy: the types Boolean, String and MultipleChoice can be removed after the corresponding old exercise data is removed.
const types = [
	'Boolean', 'String', 'MultipleChoice', // Basic types. Must be removed after input object legacy data is deleted.
	'Integer', 'Float', 'Unit', 'FloatUnit', // Number- and physics-based types.
	'Expression', 'Equation', // Expression-based types.
	'Vector', 'PositionedVector', // Object-based types.
]

// toFO takes a data object, which may be an SO, and tries to interpret it into functional components. It does so recursively for child parameters. It attempts to find which type it is and use the corresponding SOtoFO function (or SItoFO function if the useSI flag is set to true).
function toFO(data, useSI = false) {
	// Check special cases.
	if (typeof data === 'function')
		throw new Error(`Invalid Storage Object: no function is allowed in such objects.`)
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
	return applyToEachParameter(data, data => toFO(data, useSI))
}
module.exports.toFO = toFO

// toSO takes an object and tries to turn all functional objects in it into storage objects.
function toSO(obj, useSI = false) {
	// Check special cases.
	if (typeof obj === 'function')
		throw new Error(`Invalid Functional Object: cannot deal with functions.`)
	if (typeof obj !== 'object')
		return obj // Basic type.
	if (obj === null)
		return null

	// If it is a basic object or an array, do things parameter by parameter.
	if (isBasicObject(obj) || Array.isArray(obj))
		return applyToEachParameter(obj, obj => toSO(obj, useSI))

	// We have a functional object. There must be a type. If the type is known, run the corresponding functions.
	const { type } = obj
	if (typeof type !== 'string' || type === '')
		throw new Error(`Missing object type: received a functional object without a type. Could not turn it into a storage object.`)
	if (types.includes(type)) {
		const funcs = require(`./${type}`)
		const func = funcs[useSI ? 'FOtoSI' : 'FOtoSO'] || funcs.FOtoSO
		if (func)
			return func(obj)
	}

	// Attempt to extract an SO from the object.
	const { SO } = obj
	if (SO === undefined || (isObject(SO) && SO.constructor !== Object && !Array.isArray(SO)))
		throw new Error(`Invalid data type: received a functional object without a valid SO parameter. Could not turn it into a storage object.`)
	return { type, value: SO }
}
module.exports.toSO = toSO