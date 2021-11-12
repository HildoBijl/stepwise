// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isObject, deepEquals } = require('../util/objects')

const { Expression, ensureExpression, expressionStrToIO, expressionIOtoFO, support } = require('../CAS')

const { getEmpty, isEmpty } = support

// The following functions are obligatory functions.
function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Expression
}
module.exports.isFOofType = isFOofType

function FOtoIO(expression) {
	expression = ensureExpression(expression)
	return expressionStrToIO(expression.str)
}
module.exports.FOtoIO = FOtoIO

module.exports.IOtoFO = expressionIOtoFO

module.exports.getEmpty = getEmpty

module.exports.isEmpty = isEmpty

function equals(a, b) {
	return deepEquals(a, b)
}
module.exports.equals = equals