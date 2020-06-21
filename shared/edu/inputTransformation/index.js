const skills = require('../skills')
const { applyToEachParameter } = require('../../util/objects')

const types = ['Integer']

// FOtoIO takes an object { m: ..., g: ... } with multiple parameters in functional format and applies FOtoIOparameter to each parameter of it. 
function FOtoIO(obj) {
	return applyToEachParameter(obj, FOtoIOparameter)
}

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

// IOtoFO takes an object { m: ..., g: ... } with multiple parameters in input format and applies IOtoFOparameter to each parameter of it. 
function IOtoFO(obj) {
	return applyToEachParameter(obj, IOtoFOparameter)
}

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

module.exports = {
	FOtoIO,
	FOtoIOparameter,
	IOtoFO,
	IOtoFOparameter,
}