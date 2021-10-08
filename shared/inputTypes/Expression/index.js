// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isObject, deepEquals } = require('../../util/objects')
const { firstOf } = require('../../util/arrays')

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

// The following functions are obligatory functions.
function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Expression
}
module.exports.isFOofType = isFOofType

function FOtoIO(expression) {
	expression = Expression.ensureExpression(expression)

	// Assemble the input object.
	return getEmpty() // TODO
}
module.exports.FOtoIO = FOtoIO

function IOtoFO(expression) {
	const { interpretExpressionValue } = require('./interpreter/expression')
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