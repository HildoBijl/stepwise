// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { isObject, deepEquals } = require('../util/objects')

const { Expression, ensureExpression, expressionStrToSI, expressionSItoFO, expressionSOtoFO, support } = require('../CAS')

const { getEmpty, isEmpty } = support

// The following functions are obligatory functions.
function isFOofType(expression) {
	return isObject(expression) && expression.constructor === Expression
}
module.exports.isFOofType = isFOofType

function FOtoIO(expression) {
	expression = ensureExpression(expression)
	return expressionStrToSI(expression.str)
}
module.exports.FOtoIO = FOtoIO

module.exports.IOtoFO = expressionSItoFO

module.exports.getEmpty = getEmpty

module.exports.isEmpty = isEmpty

function equals(a, b) {
	return deepEquals(a, b)
}
module.exports.equals = equals

// ToDo: remove the above and keep the below after the overhaul.

module.exports.SOtoFO = (SO) => expressionSOtoFO(SO)
module.exports.SItoFO = (value, settings) => expressionSItoFO(value, settings)
module.exports.FOtoSI = (expression) => expressionStrToSI(expression.str)