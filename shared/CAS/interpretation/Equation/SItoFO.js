const { processOptions, filterOptions } = require('../../../util/objects')

const { Equation } = require('../../functionalities')
const { defaultFieldSettings, defaultExpressionSettings } = require('../../options')

const InterpretationError = require('../InterpretationError')
const { getStartCursor, getEndCursor, getSubExpression, moveRight } = require('../support')
const { SItoFO: expressionSItoFO } = require('../Expression')

function SItoFO(value, settings = {}) {
	settings = processOptions(settings, defaultFieldSettings)
	return interpretSI(value, settings)
}
module.exports = SItoFO

function interpretSI(value, settings) {
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
	const equation = new Equation({
		left: expressionSItoFO(left, settings),
		right: expressionSItoFO(right, settings),
	})

	// Apply any extra settings related to the Expression to it.
	return equation.applySettings(filterOptions(settings, defaultExpressionSettings))
}