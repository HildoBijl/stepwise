// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isObject, deepEquals } = require('../../util/objects')
const { firstOf, lastOf } = require('../../util/arrays')

const Expression = require('./abstracts/Expression')

module.exports.Expression = Expression
module.exports.bracketLevels = Expression.bracketLevels
module.exports.simplifyOptions = Expression.simplifyOptions
module.exports.equalityLevels = Expression.equalityLevels

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

function getIOValueStart(value = getEmpty()) {
	return { part: 0, cursor: 0 }
}
module.exports.getIOValueStart = getIOValueStart

function getIOValueEnd(value = getEmpty()) {
	return { part: value.length - 1, cursor: lastOf(value).value.length }
}
module.exports.getIOValueEnd = getIOValueEnd

// The following functions are obligatory functions.
function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Expression
}
module.exports.isFOofType = isFOofType

function FOtoIO(expression) {
	const { expressionStrToIO } = require('./interpreter/fromString')
	expression = Expression.ensureExpression(expression)
	return expressionStrToIO(expression.str)
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(expression, settings) {
	const { interpretExpressionValue } = require('./interpreter/expressions')
	return interpretExpressionValue(expression, settings)
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