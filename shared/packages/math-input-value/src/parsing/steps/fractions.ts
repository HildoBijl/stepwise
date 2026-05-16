import { first, last } from '@step-wise/utils'

import { InterpretationSettings } from '../../settings'
import type { FunctionInputValue, InputCursorEnd, InputValuePart } from '../../types'
import { isExpressionPart, addExpressionWrapper, getStartCursor, getEndCursor, getSubExpression, moveRight } from '../../utils'

import { findCharacterAtZeroBracketCount } from '../support'

// Turn slashes into frac functions.
export function processFractions(value: InputValuePart[], settings: InterpretationSettings, processExpression: (value: InputValuePart[], settings: InterpretationSettings) => InputValuePart[]): InputValuePart[] {
	// Set up a handler that finds the next slash symbol.
	const findNextSlash = () => {
		const part = value.findIndex(part => part.type === 'ExpressionPart' && part.value.includes('/'))
		return part === -1 ? undefined : { part, cursor: (value[part] as { type: 'ExpressionPart', value: string }).value.indexOf('/') }
	}

	// Walk through the slashes and apply them.
	for (let nextSymbol = findNextSlash(); nextSymbol; nextSymbol = findNextSlash()) value = applyFraction(value, nextSymbol, settings, processExpression)
	return value
}

function applyFraction(value: InputValuePart[], cursor: InputCursorEnd, settings: InterpretationSettings, processExpression: (value: InputValuePart[], settings: InterpretationSettings) => InputValuePart[]): InputValuePart[] {
	// Define cursors.
	const start = getStartCursor(value)
	const beforeSymbol = cursor
	const afterSymbol = moveRight(cursor)
	const leftSide = findEndOfFactor(value, beforeSymbol, false, false)
	const rightSide = findEndOfFactor(value, afterSymbol, true, true)
	const end = getEndCursor(value)

	// Set up the fraction.
	const numerator = processExpression(getSubExpression(value, leftSide, beforeSymbol), settings)
	const denominator = processExpression(getSubExpression(value, afterSymbol, rightSide), settings)
	const fractionElement = {
		type: 'Function',
		name: 'frac',
		value: [
			addExpressionWrapper(removeSurroundingBrackets(numerator)),
			addExpressionWrapper(removeSurroundingBrackets(denominator)),
		],
	} as FunctionInputValue

	// Add parts before/after the fraction.
	return [
		...getSubExpression(value, start, leftSide),
		fractionElement,
		...getSubExpression(value, rightSide, end),
	]
}

function findEndOfFactor(value: InputValuePart[], cursor: InputCursorEnd, toRight = true, atLeastOneCharacter = false): InputCursorEnd {
	const endOfTermCharacters = ['=', '+', '-', '±', '*', '/', toRight ? ')' : '(']
	return findCharacterAtZeroBracketCount(value, cursor, endOfTermCharacters, toRight, atLeastOneCharacter)
}

// Helper to remove starting/ending brackets from an expression value.
function removeSurroundingBrackets(value: InputValuePart[]): InputValuePart[] {
	// If there are no brackets at the start/end, do nothing.
	const start = first(value)
	if (!isExpressionPart(start) || start.value.slice(0, 1) !== '(') return value
	const end = last(value)
	if (!isExpressionPart(end) || end.value.slice(-1) !== ')') return value

	// Remove the brackets.
	if (start === end) return [{ ...start, value: start.value.slice(1, -1) }]
	return [
		{ ...start, value: start.value.slice(1) },
		...value.slice(1, -1),
		{ ...end, value: end.value.slice(0, -1) },
	]
}
