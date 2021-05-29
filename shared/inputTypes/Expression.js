// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isObject, processOptions } = require('../util/objects')

// TODO
// const numberFormat = '(-?(\\d+[.,]?\\d*)|(\\d*[.,]?\\d+))'
// const timesFormat = '(\\s*\\*\\s*)'
// // const tenPowerFormat = '10\\^(?:(?:\\((?<powerWithBrackets>-?\\d+)\\))|(?<powerWithoutBrackets>-?\\d+))' // Firefox doesn't support named capture groups.
// const tenPowerFormat = '(10\\^((\\((-?\\d+)\\))|(-?\\d+)))'
// const floatFormat = `(${numberFormat}${timesFormat}${tenPowerFormat}|${tenPowerFormat}|${numberFormat})` // Either a number, or a ten-power, or both with a multiplication in-between. (In reverse order, having more complex first)

// const regNumberFormat = new RegExp(`^${numberFormat}$`)
// const regTenPowerFormat = new RegExp(`^${tenPowerFormat}$`)
// const regFloatFormat = new RegExp(`^${floatFormat}$`)
// module.exports.floatFormat = floatFormat
// module.exports.numberFormat = numberFormat

const defaultParameters = {
	// TODO
}

class Expression {
	/* The constructor input can be of the form string or SO.
	 * string: A string of the form [ToDo]
	 * SO: An object with parameters
		 * [ToDo]
	 */
	constructor(input = {}) {
		// If we have a type Expression, just copy it.
		if (isObject(input) && input.constructor === Expression)
			return this.become(Expression)

		// Include default values.
		input = processOptions(input, defaultParameters)

		// Process everything.
		this.stuff = 'TODO' // TODO
	}

	// become turns this object into a clone of the given object.
	become(param) {
		if (!isObject(param) || param.constructor !== Expression)
			throw new Error(`Invalid input: an Expression element cannot become the given object. This object has type "${typeof param}".`)

		// TODO
		// this._number = param.number
		// this._significantDigits = param.significantDigits
		// this._power = param.power
		return this
	}

	// str returns a string representation of this number.
	get str() {
		return this.toString()
	}

	// toString returns a string representation of this object.
	toString() {
		return 'TODO'
	}

	get tex() {
		return '\\sqrt{a^2+b^2}' // TODO
	}

	// SO returns a storage object representation of this object that can be interpreted again.
	get SO() {
		return {} // TODO
	}

	// clone provides a clone of this object.
	clone() {
		return new this.constructor(this.SO)
	}

	// simplify sets
	simplify() {
		return this // TODO
	}

	// equals compares two Expressions. It only returns true or false.
	equals(x, options = {}) {
		return this.checkEquality(x, options).result
	}

	// checkEquality compares
	checkEquality(x, options = {}) {
		return false // TODO
	}

	// applyMinus will
	applyMinus() {
		return this // TODO
	}

	// abs will
	abs() {
		return this // TODO
	}

	// add will
	add(x, keepDecimals = false) {
		return this // TODO
	}

	// subtract will
	subtract(x) {
		return this // TODO
	}

	// invert will
	invert() {
		return this // TODO
	}

	// multiply multiplies
	multiply(x) {
		return this // TODO
	}

	// divide will
	divide(x) {
		return this // TODO
	}

	// toPower will
	toPower(power) {
		return this // TODO
	}
}
module.exports.Expression = Expression

Expression.defaultEqualityOptions = {
	// TODO
}



// The following functions are obligatory functions.
function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Float
}
module.exports.isFOofType = isFOofType

function FOtoIO(expression) {
	// Check if we have an Expression object already. If not, turn it into one. (Or die trying.)
	if (expression.constructor !== expression)
		expression = new Expression(expression)

	// Assemble the input object.
	return [''] // TODO
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(expressionArray) {
	return new Expression({}) // TODO
}
module.exports.IOtoFO = IOtoFO

function getEmpty() {
	return ['']
}
module.exports.getEmpty = getEmpty

function isEmpty(expressionArray) {
	return expressionArray.length === 1 && expression[0] === ''
}
module.exports.isEmpty = isEmpty

function equals(a, b) {
	// ToDo
	return deepEquals(a, b)
}
module.exports.equals = equals