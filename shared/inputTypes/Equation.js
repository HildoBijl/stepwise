// An Equation is an input type containing two expressions with an equals sign in-between.

const { isObject, deepEquals } = require('../util/objects')

const { Equation, ensureEquation, equationStrToIO, equationIOtoFO, support } = require('../CAS')

const { getEmpty, isEmpty } = support

// The following functions are obligatory functions.
function isFOofType(equation) {
	return isObject(equation) && equation.constructor === Equation
}
module.exports.isFOofType = isFOofType

function FOtoIO(equation) {
	equation = ensureEquation(equation)
	return equationStrToIO(equation.str)
}
module.exports.FOtoIO = FOtoIO

module.exports.IOtoFO = equationIOtoFO

module.exports.getEmpty = getEmpty

module.exports.isEmpty = isEmpty

function equals(a, b) {
	return deepEquals(a, b)
}
module.exports.equals = equals