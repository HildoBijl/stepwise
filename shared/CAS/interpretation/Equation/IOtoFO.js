const { Equation } = require('../../functionalities')

const InterpretationError = require('../InterpretationError')
const { IOtoFO: expressionIOtoFO, getStartCursor, getEndCursor, getSubExpression, moveRight } = require('../Expression')

function IOtoFO(value, settings = {}) {
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
	const start = getStartCursor(value)
	const equalsPosition = { part, cursor }
	const end = getEndCursor(value)
	const left = getSubExpression(value, start, equalsPosition)
	const right = getSubExpression(value, moveRight(equalsPosition), end)
	return new Equation({
		left: expressionIOtoFO(left, settings),
		right: expressionIOtoFO(right, settings),
	})
}
module.exports = IOtoFO