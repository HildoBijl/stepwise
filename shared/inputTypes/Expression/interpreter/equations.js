// The equation interpreter takes an equation in Input Object (IO) format and turns it into a Functional Object (FO).

import { isObject } from '../../../util/objects'
import { lastOf } from '../../../util/arrays'

import { interpretExpressionValue } from './expressions'
import { InterpretationError } from './InterpretationError'
import { getSubExpression, moveRight } from './support'

import { Equation } from '../../Equation'

// interpretEquation turns an IO equation into a functional object (FO).
export function interpretEquation(obj) {
	// Check the type.
	if (!isObject(obj))
		throw new Error(`Interpreting error: the function interpretEquation was called but was not given an object. Instead, it was given "${obj}".`)
	if (obj.type !== 'Equation')
		throw new Error(`Interpreting error: the function interpretEquation was called on an object of type "${obj.type}". This must be an equation type.`)

	// Interpret the value.
	return interpretEquationValue(obj.value)
}

export function interpretEquationValue(value) {
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
	const start = { part: 0, cursor: 0 }
	const equalsPosition = { part, cursor }
	const end = { part: value.length - 1, cursor: lastOf(value).value.length }
	const left = getSubExpression(value, start, equalsPosition)
	const right = getSubExpression(value, moveRight(equalsPosition), end)
	return new Equation({
		left: interpretExpressionValue(left),
		right: interpretExpressionValue(right),
	})
}
