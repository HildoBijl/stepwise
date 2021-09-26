const { lastOf } = require('../../../util/arrays')

const { interpretExpressionValue } = require('./Expression')
const { InterpretationError } = require('./InterpretationError')
const { getSubExpression } = require('./support')

const { Equation } = require('../../Equation')

// interpretEquation turns an IO equation into a functional object (FO).
function interpretEquation(obj) {
	// Check the type.
	if (!isObject(obj))
		throw new Error(`Interpreting error: the function interpretEquation was called but was not given an object. Instead, it was given "${obj}".`)
	if (obj.type !== 'Expression')
		throw new Error(`Interpreting error: the function interpretEquation was called on an object of type "${obj.type}". This must be an equation type.`)

	// Interpret the value.
	return interpretEquationValue(obj.value)
}
module.exports.interpretEquation = interpretEquation

function interpretEquationValue(value) {
	// Walk through the expression to find an equals symbol.
	let part, cursor
	value.forEach((element, partIndex) => {
		// Only examine ExpressionParts.
		if (element.type !== 'ExpressionPart')
			return

		// Find an equals sign.
		const equalsPosition = element.value.indexOf('=')
		if (equalsPosition === -1)
			return

		// Check if an equals sign has already been found, either in an earlier ExpressionPart, or later on in this same ExpressionPart.
		if (part !== undefined || element.value.indexOf('=', equalsPosition + 1) !== -1)
			throw new InterpretationError('MultipleEqualsSigns', partIndex, `Could not interpret the equation due to multiple equals signs being present.`)

		// Remember the position of the equals sign.
		part = partIndex
		cursor = equalsPosition
	})

	// Check that an equals sign has been found.
	if (part === undefined)
		throw new InterpretationError('MissingEqualsSign', undefined, `Could not interpret the equation due to no equals sign being present.`)

	// Split up the Expression at the given equals sign and interpret both parts separately.
	const left = getSubExpression(value, { part: 0, cursor: 0 }, { part, cursor })
	const right = getSubExpression(value, { part, cursor: cursor + 1 }, { part: value.length - 1, cursor: lastOf(value).value.length })
	return new Equation({
		left: interpretExpressionValue(left),
		right: interpretExpressionValue(right),
	})
}
module.exports.interpretEquationValue = interpretEquationValue