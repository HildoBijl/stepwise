import { findNextOf, isObject, last, InterpretationError } from '@step-wise/utils'

import type { FunctionInputValue, InputCursorEnd, InputValuePart } from '../types'

import { advancedFunctionSettings, isAdvancedFunction } from './functionDefinitions'

export const roundBrackets = ['(', ')'] as const
export const squareBrackets = ['[', ']'] as const
export type BracketPair = typeof roundBrackets | typeof squareBrackets

type WantedCharacter = string | string[] | ((symbol: string | InputValuePart) => boolean)
type MatchingBrackets = { opening: InputCursorEnd, closing: InputCursorEnd }

// Walk through an expression and find a wanted character at net bracket count zero.
export function findCharacterAtZeroBracketCount(value: InputValuePart[], cursor: InputCursorEnd, isWantedCharacter: WantedCharacter, toRight = true, skipFirst = false, brackets: BracketPair = roundBrackets): InputCursorEnd {
	const isWanted = typeof isWantedCharacter === 'function' ? isWantedCharacter : (symbol: string | InputValuePart) => typeof symbol === 'string' && (Array.isArray(isWantedCharacter) ? isWantedCharacter : [isWantedCharacter]).includes(symbol)

	// Define iterators.
	let { part: partIterator, cursor: cursorIterator } = cursor
	let bracketCount = 0

	// Define supporting handlers.
	const getCurrentExpressionPart = () => {
		const element = value[partIterator]
		if (element.type !== 'ExpressionPart') throw new Error('Cursor must point to an ExpressionPart.')
		return element
	}
	const hasNextSymbol = () => {
		const currentString = getCurrentExpressionPart().value
		return toRight ? partIterator < value.length - 1 || cursorIterator < currentString.length : partIterator > 0 || cursorIterator > 0
	}
	const getNextSymbol = (): string | InputValuePart => {
		const currentString = getCurrentExpressionPart().value
		if (toRight) {
			if (cursorIterator === currentString.length) return value[partIterator + 1]
			return currentString[cursorIterator]
		}
		if (cursorIterator === 0) return value[partIterator - 1]
		return currentString[cursorIterator - 1]
	}
	const shiftCursor = () => {
		const currentString = getCurrentExpressionPart().value
		if (toRight) {
			if (cursorIterator === currentString.length) {
				partIterator += 2
				cursorIterator = 0
			} else cursorIterator++
		} else {
			if (cursorIterator === 0) {
				partIterator -= 2
				cursorIterator = getCurrentExpressionPart().value.length
			} else cursorIterator--
		}
	}

	// Walk through the expression 
	let isFirst = true
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// Return on a wanted character at bracket count zero.
		if (bracketCount <= 0 && isWanted(nextSymbol) && (!skipFirst || !isFirst)) return { part: partIterator, cursor: cursorIterator }

		// Adjust bracket count.
		if (nextSymbol === brackets[0]) bracketCount += toRight ? 1 : -1
		else if (nextSymbol === brackets[1]) bracketCount += toRight ? -1 : 1

		// Functions with a parameter after them count as a round opening bracket too.
		if (isFunctionWithParameterAfter(nextSymbol) && brackets[0] === '(') bracketCount += toRight ? 1 : -1

		// Move to the next symbol.
		shiftCursor()
		isFirst = false
	}

	return { part: partIterator, cursor: cursorIterator }
}

export function findNextClosingBracket(value: InputValuePart[], cursor: InputCursorEnd): InputCursorEnd {
	return findCharacterAtZeroBracketCount(value, cursor, ')')
}

export function findEndOfTerm(value: InputValuePart[], cursor: InputCursorEnd, toRight = true, atLeastOneCharacter = false): InputCursorEnd {
	const endOfTermCharacters = ['=', '+', '-', '±', '*', '/', toRight ? ')' : '(']
	return findCharacterAtZeroBracketCount(value, cursor, endOfTermCharacters, toRight, atLeastOneCharacter)
}

// Return top-level matching brackets; nested brackets are assumed to match.
export function getMatchingBrackets(value: InputValuePart[]): MatchingBrackets[] {
	const brackets: Partial<MatchingBrackets>[] = []
	let level = 0

	// Define handlers to register bracket positions.
	const noteOpeningBracket = (position: InputCursorEnd) => {
		if (level === 0) brackets.push({ opening: position })
		level++
	}
	const noteClosingBracket = (position: InputCursorEnd) => {
		if (level === 0) throw new InterpretationError('Could not interpret the expression due to a missing opening bracket.', 'UnmatchedClosingBracket', position)
		if (level === 1) last(brackets).closing = position
		level--
	}

	// Walk through the expression to find the bracket pairs.
	value.forEach((element, part) => {
		// Check for special function that counts as opening bracket.
		if (isFunctionWithParameterAfter(element)) noteOpeningBracket({ part, cursor: 0 })
		if (element.type !== 'ExpressionPart') return

		// Walk through the ExpressionPart.
		const str = element.value
		const getNextBracket = (fromPosition = -1) => findNextOf(str, ['(', ')', '[', ']'], fromPosition + 1)
		for (let nextBracket = getNextBracket(); nextBracket !== -1; nextBracket = getNextBracket(nextBracket)) {
			const bracketPosition = { part, cursor: nextBracket }
			if (str[nextBracket] === '(' || str[nextBracket] === '[') noteOpeningBracket(bracketPosition)
			else noteClosingBracket(bracketPosition)
		}
	})

	// Finalize the bracket pairing.
	if (level > 0) throw new InterpretationError('Could not interpret the expression part due to a missing closing bracket.', 'UnmatchedOpeningBracket', last(brackets).opening)
	return brackets as MatchingBrackets[]
}

function isFunctionWithParameterAfter(symbol: string | InputValuePart): symbol is FunctionInputValue {
	if (!isObject(symbol) || (symbol as InputValuePart).type !== 'Function') return false
	const name = (symbol as FunctionInputValue).name
	if (!isAdvancedFunction(name)) return false
	const settings = advancedFunctionSettings[name]
	return 'hasParameterAfter' in settings && settings.hasParameterAfter
}
