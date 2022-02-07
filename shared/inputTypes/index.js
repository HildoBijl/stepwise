const { isObject, isBasicObject, applyToEachParameter, deepEquals } = require('../util/objects')

const oldTypes = ['FloatUnit'] // ToDo: remove these old types after the overhaul.

const types = [
	'Boolean', 'String', 'MultipleChoice', // Basic types. Must be removed after legacy data is deleted.
	'Integer', 'Float', 'Unit', // Number- and physics-based types.
	'Expression', 'Equation', // Expression-based types.
	'Vector', 'PositionedVector', // Object-based types.
]
// ToDo: remove Boolean, String and MultipleChoice and the corresponding file after the overhaul.

// ToDo: clean up this file. Only toSO and toFO should stay.

// setFOtoIO takes an object { m: ..., g: ... } with multiple parameters in functional format and applies FOtoIO to each parameter of it. 
function setFOtoIO(obj) {
	return applyToEachParameter(obj, FOtoIO)
}
module.exports.setFOtoIO = setFOtoIO

// FOtoIO transforms a functional object (like a Number() object) into an input object representation like { type: "Number", value: { number: "314.159", power: "-2" } }.
function FOtoIO(param) {
	// Check boundary cases.
	if (param === undefined)
		return null

	// Find out what type of object we have.
	const type = oldTypes.find(type => require(`./${type}`).isFOofType(param))
	if (!type)
		return param // No type found. Keep the parameter as is.

	// Transform the object accordingly.
	return {
		type,
		value: require(`./${type}`).FOtoIO(param),
	}
}
module.exports.FOtoIO = FOtoIO

// setIOtoFO takes an object { m: ..., g: ... } with multiple parameters in input format and applies IOtoFO to each parameter of it. 
function setIOtoFO(obj) {
	return applyToEachParameter(obj, IOtoFO)
}
module.exports.setIOtoFO = setIOtoFO

// IOtoFO transforms an input object representation like { type: "Number", value: { number: "314.159", power: "-2" } } into a functional object (like a Number() object).
function IOtoFO(obj) {
	// Check boundary cases.
	if (obj === undefined || obj === null)
		return null // Nothing given. Use null.
	if (Array.isArray(obj))
		return obj.map(element => IOtoFO(element)) // An array. Apply to each array element.
	if (typeof obj !== 'object')
		return obj // No object. Keep as is.
	if (!obj.type)
		return applyToEachParameter(obj, IOtoFO) // No type found. It's an object with multiple parameters. Apply to each parameter separately.

	// Check the given type.
	if (!oldTypes.includes(obj.type))
		throw new Error(`Invalid object type "${obj.type}" detected when transforming to input object. No transforming function is known for this type.`)

	// Transform accordingly.
	return require(`./${obj.type}`).IOtoFO(obj.value, obj.settings)
}
module.exports.IOtoFO = IOtoFO

// isEmpty checks if an input object representation like { type: "Integer", value: "" } is empty or not.
function isEmpty(obj) {
	// Check boundary cases.
	if (obj === undefined || obj === null)
		return true

	// Check for arrays.
	if (Array.isArray(obj))
		return obj.length === 0

	// Check for a valid object.
	if (!isObject(obj))
		throw new Error(`Invalid call: input fields must always give an object or array. No native types are supported. Received "${JSON.stringify(obj)}".`)

	// Check if there is a type. If not, verify if it equals an empty object.
	if (!obj.type)
		return Object.keys(obj).length === 0

	// There is a type. Check if it's known.
	if (!oldTypes.includes(obj.type))
		throw new Error(`Unknown object type: cannot figure out object of type "${obj.type}". The object's value itself was "${JSON.stringify(obj)}".`)

	// Pass along according to the type.
	return require(`./${obj.type}`).isEmpty(obj.value)
}
module.exports.isEmpty = isEmpty

// equals checks if two input object representations like { type: "Integer", value: "-42" } are equal. If they are other types of objects, a deep comparison is executed.
function equals(a, b) {
	// Check if they are objects that we can compare.
	if (!isObject(a) || !isObject(b))
		return deepEquals(a, b)

	// Check if they have types that we can compare.
	if (!a.type || !oldTypes.includes(a.type) || !b.type || !oldTypes.includes(b.type))
		return deepEquals(a, b)
	if (a.type !== b.type)
		return false

	// Pass along the call to the respective type.
	return require(`./${a.type}`).equals(a.value, b.value)
}
module.exports.equals = equals

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

	// ToDo: remove this after the overhaul.
	// If the old type is known, use the old method.
	if (oldTypes.includes(type))
		return require(`./${type}`).IOtoFO(value, settings)

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

	// ToDo: remove this after the overhaul.
	// Check if it is one of the old types and process it accordingly.
	const oldType = oldTypes.find(type => require(`./${type}`).isFOofType(obj))
	if (oldType)
		return { type: oldType, value: require(`./${oldType}`).FOtoIO(obj) }

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