const { applyToEachParameter, isObject, deepEquals } = require('../util/objects')

const types = ['String', 'Integer', 'Float', 'Unit', 'FloatUnit', 'MultipleChoice', 'Expression' ,'Equation']

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
	const type = types.find(type => require(`./${type}`).isFOofType(param))
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
	if (obj === undefined)
		return null
	if (!obj.type)
		return obj // No type found. Keep the parameter as is.

	// Check the given type.
	if (!types.includes(obj.type))
		throw new Error(`Invalid object type "${obj.type}" detected when transforming to input object. No transforming function is known for this type.`)

	// Transform accordingly.
	return require(`./${obj.type}`).IOtoFO(obj.value)
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
	if (!types.includes(obj.type))
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
	if (!a.type || !types.includes(a.type) || !b.type || !types.includes(b.type))
		return deepEquals(a, b)
	if (a.type !== b.type)
		return false

	// Pass along the call to the respective type.
	return require(`./${a.type}`).equals(a.value, b.value)
}
module.exports.equals = equals

// inputSetsEqual checks if two input sets are equal. For instance, the set { x: { type: "Integer", value: "-42" }, y: { type: "Integer", value: "12" } }. It does this by calling the equals function for each parameter.
function inputSetsEqual(a, b) {
	// Check for non-object types.
	if (!isObject(a) || !isObject(b))
		throw new Error(`Invalid input set: tried to compare two input sets, but one of them wasn't an object. Tried to compare "${JSON.stringify(a)}" with "${JSON.stringify(b)}".`)

	// Check number of keys.
	const keys1 = Object.keys(a)
	const keys2 = Object.keys(b)
	if (keys1.length !== keys2.length)
		return false

	// Merge keys and check new length.
	const keys = [...new Set([...keys1, ...keys2])]
	if (keys.length !== keys1.length)
		return false

	// Walk through keys and check equality.
	return keys.every(key => equals(a[key], b[key]))
}
module.exports.inputSetsEqual = inputSetsEqual