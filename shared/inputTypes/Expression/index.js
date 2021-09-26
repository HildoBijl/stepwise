// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isInt, isNumber } = require('../../util/numbers')
const { isObject, deepEquals } = require('../../util/objects')
const { firstOf } = require('../../util/arrays')

const Expression = require('./abstracts/Expression')

module.exports.Expression = Expression
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
	const { interpretExpressionValue } = require('./interpreter/Expression')
	return interpretExpressionValue(expression)
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
	return deepEquals(a, b)
}
module.exports.equals = equals