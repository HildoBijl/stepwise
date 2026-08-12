import { first, last } from '@step-wise/utils'

import { type InterpretationSettings } from '../../settings'
import type { ExpressionValue, InputCursorEnd } from '../../types'
import { constructDefinitions } from '../../definitions'
import { getStartCursor, getEndCursor, getSubExpression, shiftPositionRight } from '../../utils'

import { findEndOfFactor } from '../support'

// Turn slashes into fractions.
export function processFractions(value: ExpressionValue, settings: InterpretationSettings, processExpression: (value: ExpressionValue, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	const findNextSlash = () => {
		const part = value.findIndex(part => typeof part === 'string' && part.includes('/'))
		return part === -1 ? undefined : { part, cursor: (value[part] as string).indexOf('/') }
	}
	for (let nextSymbol = findNextSlash(); nextSymbol; nextSymbol = findNextSlash()) value = applyFraction(value, nextSymbol, settings, processExpression)
	return value
}

// Turn a fraction at a given position into a fraction construct.
function applyFraction(value: ExpressionValue, cursor: InputCursorEnd, settings: InterpretationSettings, processExpression: (value: ExpressionValue, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	const start = getStartCursor(value)
	const beforeSymbol = cursor
	const afterSymbol = shiftPositionRight(cursor)
	const leftSide = findEndOfFactor(value, beforeSymbol, false, false)
	const rightSide = findEndOfFactor(value, afterSymbol, true, true)
	const end = getEndCursor(value)
	const numerator = removeSurroundingBrackets(processExpression(getSubExpression(value, leftSide, beforeSymbol) as ExpressionValue, settings))
	const denominator = removeSurroundingBrackets(processExpression(getSubExpression(value, afterSymbol, rightSide) as ExpressionValue, settings))
	return [
		...getSubExpression(value, start, leftSide) as ExpressionValue,
		{ type: 'Fraction', alias: constructDefinitions.Fraction.aliases[0], numerator, denominator },
		...getSubExpression(value, rightSide, end) as ExpressionValue,
	]
}

// Remove potential brackets around a given expression value.
function removeSurroundingBrackets(value: ExpressionValue): ExpressionValue {
	const start = first(value)
	if (typeof start !== 'string' || start.slice(0, 1) !== '(') return value
	const end = last(value)
	if (typeof end !== 'string' || end.slice(-1) !== ')') return value
	if (start === end) return [start.slice(1, -1)]
	return [start.slice(1), ...value.slice(1, -1), end.slice(0, -1)]
}
