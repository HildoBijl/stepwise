const { applyToEachParameter, isObject, deepEquals } = require('../../../util/objects')

const types = ['Integer', 'Float']

// FOtoIO takes an object { m: ..., g: ... } with multiple parameters in functional format and applies FOtoIOparameter to each parameter of it. 
function FOtoIO(obj) {
	return applyToEachParameter(obj, FOtoIOparameter)
}
module.exports.FOtoIO = FOtoIO

// FOtoIOparameter transforms a functional object (like a Number() object) into an input object representation like { type: "Number", value: { number: "314.159", power: "-2" } }.
function FOtoIOparameter(param) {
	// Check boundary cases.
	if (param === undefined)
		return null

	// Find out what type of object we have.
	const type = types.find(type => require(`./${type}`).isFOofType(param))
	if (!type)
		throw new Error(`Could not detect the type of the parameter when transforming from functional to input format. The given parameter was "${JSON.stringify(param)}".`)

	// Transform the object accordingly.
	return {
		type,
		value: require(`./${type}`).FOtoIO(param),
	}
}
module.exports.FOtoIOparameter = FOtoIOparameter

// IOtoFO takes an object { m: ..., g: ... } with multiple parameters in input format and applies IOtoFOparameter to each parameter of it. 
function IOtoFO(obj) {
	return applyToEachParameter(obj, IOtoFOparameter)
}
module.exports.IOtoFO = IOtoFO

// IOtoFOparameter transforms an input object representation like { type: "Number", value: { number: "314.159", power: "-2" } } into a functional object (like a Number() object).
function IOtoFOparameter(obj) {
	// Check boundary cases.
	if (obj === undefined)
		return null
	if (!obj.type)
		return obj

	// Check the given type.
	if (!types.includes(obj.type))
		throw new Error(`Invalid object type "${obj.type}" detected when transforming to input object. No transforming function is known for this type.`)

	// Transform accordingly.
	return require(`./${obj.type}`).IOtoFO(obj.value)
}
module.exports.IOtoFOparameter = IOtoFOparameter

// isEmpty checks if an input object representation like { type: "Integer", value: "" } is empty or not.
function isEmpty(obj) {
	// Check boundary cases.
	if (obj === undefined || obj === null)
		return true
	if (!obj.type || !types.includes(obj.type))
		throw new Error(`Unknown object type: cannot figure out object of type "${obj.type}".`)

	// Pass along accordingly.
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
		return a === b

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