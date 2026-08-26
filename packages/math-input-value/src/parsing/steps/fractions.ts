import { first, last } from '@step-wise/js-utils'

import { type InterpretationSettings } from '../../settings'
import { constructDefinitions } from '../../definitions'
import type { ExpressionValue, ExpressionTextCursor } from '../../types'
import { getExpressionStartCursor, getExpressionEndCursor, sliceExpressionValue, shiftExpressionTextCursorRight } from '../../utils'

import { findEndOfFactor } from '../support'

// Turn slashes into fractions.
export function parseFractions(value: ExpressionValue, settings: InterpretationSettings, parseExpressionValue: (value: ExpressionValue, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	const findNextSlash = () => {
		const part = value.findIndex(part => typeof part === 'string' && part.includes('/'))
		return part === -1 ? undefined : { part, cursor: (value[part] as string).indexOf('/') }
	}
	for (let nextSymbol = findNextSlash(); nextSymbol; nextSymbol = findNextSlash()) value = replaceSlashWithFraction(value, nextSymbol, settings, parseExpressionValue)
	return value
}

// Turn a fraction at a given position into a fraction construct.
function replaceSlashWithFraction(value: ExpressionValue, cursor: ExpressionTextCursor, settings: InterpretationSettings, parseExpressionValue: (value: ExpressionValue, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	const start = getExpressionStartCursor(value)
	const beforeSymbol = cursor
	const afterSymbol = shiftExpressionTextCursorRight(cursor)
	const leftSide = findEndOfFactor(value, beforeSymbol, false, false)
	const rightSide = findEndOfFactor(value, afterSymbol, true, true)
	const end = getExpressionEndCursor(value)
	const numerator = removeSurroundingBrackets(parseExpressionValue(sliceExpressionValue(value, leftSide, beforeSymbol) as ExpressionValue, settings))
	const denominator = removeSurroundingBrackets(parseExpressionValue(sliceExpressionValue(value, afterSymbol, rightSide) as ExpressionValue, settings))
	return [
		...sliceExpressionValue(value, start, leftSide) as ExpressionValue,
		{ type: 'Fraction', alias: constructDefinitions.Fraction.aliases[0], numerator, denominator },
		...sliceExpressionValue(value, rightSide, end) as ExpressionValue,
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
