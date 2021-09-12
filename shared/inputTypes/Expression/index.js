// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isInt, isNumber } = require('../../util/numbers')
const { isObject } = require('../../util/objects')
const { firstOf } = require('../../util/arrays')

const Expression = require('./abstracts/Expression')

module.exports.bracketLevels = Expression.bracketLevels
module.exports.simplifyOptions = Expression.simplifyOptions

function getExpressionTypes() {
	return {
		...require('./functions'),
		Integer: require('./Integer'),
		Float: require('./Float'),
		Variable: require('./Variable'),
		Sum: require('./Sum'),
		Product: require('./Product'),
	}
}
module.exports.getExpressionTypes = getExpressionTypes

function ensureFO(obj) {
	const Integer = require('./Integer')
	const Float = require('./Float')
	const Variable = require('./Variable')

	// Check if this is easy to interpret.
	if (obj instanceof Expression)
		return obj // All good already!
	if (isInt(obj))
		return new Integer(obj)
	if (isNumber(obj))
		return new Float(obj)
	if (typeof obj === 'string')
		return new Variable(obj)

	// No easy interpretations. Check if this is a raw object with a type parameter.
	if (!isObject(obj))
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but it was "${obj}".`)
	if (!obj.type)
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but it is a basic data object without a type property. Cannot interpret it.`)

	// Check the given type.
	const types = getExpressionTypes()
	if (!types[obj.type])
		throw new Error(`Invalid expression object: received an object that was supposedly an Expression, but its type "${obj.type}" is not known.`)

	// Pass the object to the right constructor.
	return new types[obj.type](obj)
}
module.exports.ensureFO = ensureFO







// // TODO
// // const numberFormat = '(-?(\\d+[.,]?\\d*)|(\\d*[.,]?\\d+))'
// // const timesFormat = '(\\s*\\*\\s*)'
// // // const tenPowerFormat = '10\\^(?:(?:\\((?<powerWithBrackets>-?\\d+)\\))|(?<powerWithoutBrackets>-?\\d+))' // Firefox doesn't support named capture groups.
// // const tenPowerFormat = '(10\\^((\\((-?\\d+)\\))|(-?\\d+)))'
// // const floatFormat = `(${numberFormat}${timesFormat}${tenPowerFormat}|${tenPowerFormat}|${numberFormat})` // Either a number, or a ten-power, or both with a multiplication in-between. (In reverse order, having more complex first)

// // const regNumberFormat = new RegExp(`^${numberFormat}$`)
// // const regTenPowerFormat = new RegExp(`^${tenPowerFormat}$`)
// // const regFloatFormat = new RegExp(`^${floatFormat}$`)
// // module.exports.floatFormat = floatFormat
// // module.exports.numberFormat = numberFormat

// const defaultParameters = {
// 	// TODO
// }

// class Expression {
// 	/* The constructor input can be of the form string or SO.
// 	 * string: A string of the form [ToDo]
// 	 * SO: An object with parameters
// 		 * [ToDo]
// 	 */
// 	constructor(input = {}) {
// 		// If we have a type Expression, just copy it.
// 		if (isObject(input) && input.constructor === Expression)
// 			return this.become(Expression)

// 		// Include default values.
// 		input = processOptions(input, defaultParameters)

// 		// Process everything.
// 		this.stuff = 'TODO' // TODO
// 	}

// 	// become turns this object into a clone of the given object.
// 	become(param) {
// 		if (!isObject(param) || param.constructor !== Expression)
// 			throw new Error(`Invalid input: an Expression element cannot become the given object. This object has type "${typeof param}".`)

// 		// TODO
// 		// this._number = param.number
// 		// this._significantDigits = param.significantDigits
// 		// this._power = param.power
// 		return this
// 	}

// 	// str returns a string representation of this number.
// 	get str() {
// 		return this.toString()
// 	}

// 	// toString returns a string representation of this object.
// 	toString() {
// 		return 'TODO'
// 	}

// 	get tex() {
// 		return '\\sqrt{a^2+b^2}' // TODO
// 	}

// 	// SO returns a storage object representation of this object that can be interpreted again.
// 	get SO() {
// 		return {} // TODO
// 	}

// 	// clone provides a clone of this object.
// 	clone() {
// 		return new this.constructor(this.SO)
// 	}

// 	// simplify sets
// 	simplify() {
// 		return this // TODO
// 	}

// 	// equals compares two Expressions. It only returns true or false.
// 	equals(x, options = {}) {
// 		return this.checkEquality(x, options).result
// 	}

// 	// checkEquality compares
// 	checkEquality(x, options = {}) {
// 		return false // TODO
// 	}

// 	// applyMinus will
// 	applyMinus() {
// 		return this // TODO
// 	}

// 	// abs will
// 	abs() {
// 		return this // TODO
// 	}

// 	// add will
// 	add(x, keepDecimals = false) {
// 		return this // TODO
// 	}

// 	// subtract will
// 	subtract(x) {
// 		return this // TODO
// 	}

// 	// invert will
// 	invert() {
// 		return this // TODO
// 	}

// 	// multiply multiplies
// 	multiply(x) {
// 		return this // TODO
// 	}

// 	// divide will
// 	divide(x) {
// 		return this // TODO
// 	}

// 	// toPower will
// 	toPower(power) {
// 		return this // TODO
// 	}
// }
// module.exports.Expression = Expression

// Expression.defaultEqualityOptions = {
// 	// TODO
// }



// The following functions are obligatory functions.
function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Expression
}
module.exports.isFOofType = isFOofType

function FOtoIO(expression) {
	expression = ensureFO(expression)

	// Assemble the input object.
	return getEmpty() // TODO
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(expression) {
	return new Expression() // TODO
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return [{ type: 'ExpressionPart', value: '' }]
}
module.exports.getEmpty = getEmpty

function isEmpty(expression) {
	const firstElement = firstOf(expression)
	return expression.length === 1 && firstElement && firstElement.value === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	return deepEquals(a, b) // ToDo
}
module.exports.equals = equals