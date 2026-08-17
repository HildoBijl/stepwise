import { findNextOf, last, InterpretationError } from '@step-wise/js-utils'

import type { InputCursorEnd, InputValuePart } from '../types'
import { isTextPart } from '../utils'
import { opensExternalGroup } from '../definitions'

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
	const getCurrentTextPart = () => {
		const element = value[partIterator]
		if (!isTextPart(element)) throw new Error('Cursor must point to a text part.')
		return element
	}
	const hasNextSymbol = () => {
		const currentString = getCurrentTextPart()
		return toRight ? partIterator < value.length - 1 || cursorIterator < currentString.length : partIterator > 0 || cursorIterator > 0
	}
	const getNextSymbol = (): string | InputValuePart => {
		const currentString = getCurrentTextPart()
		if (toRight) {
			if (cursorIterator === currentString.length) return value[partIterator + 1]
			return currentString[cursorIterator]
		}
		if (cursorIterator === 0) return value[partIterator - 1]
		return currentString[cursorIterator - 1]
	}
	const shiftCursor = () => {
		const currentString = getCurrentTextPart()
		if (toRight) {
			if (cursorIterator === currentString.length) {
				partIterator += 2
				cursorIterator = 0
			} else cursorIterator++
		} else {
			if (cursorIterator === 0) {
				partIterator -= 2
				cursorIterator = getCurrentTextPart().length
			} else cursorIterator--
		}
	}

	// Walk through the expression.
	let isFirst = true
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// Return on a wanted character at bracket count zero.
		if (bracketCount <= 0 && isWanted(nextSymbol) && (!skipFirst || !isFirst)) return { part: partIterator, cursor: cursorIterator }

		// Adjust bracket count. Constructs with an external group count as a round opening bracket too.
		if (nextSymbol === brackets[0]) bracketCount += toRight ? 1 : -1
		else if (nextSymbol === brackets[1]) bracketCount += toRight ? -1 : 1
		if (typeof nextSymbol !== 'string' && opensExternalGroup(nextSymbol.type) && brackets[0] === '(') bracketCount += toRight ? 1 : -1

		// Move to the next symbol.
		shiftCursor()
		isFirst = false
	}

	return { part: partIterator, cursor: cursorIterator }
}

export function findNextClosingBracket(value: InputValuePart[], cursor: InputCursorEnd): InputCursorEnd {
	return findCharacterAtZeroBracketCount(value, cursor, ')')
}

export function findEndOfFactor(value: InputValuePart[], cursor: InputCursorEnd, toRight = true, atLeastOneCharacter = false): InputCursorEnd {
	const endOfFactorCharacters = ['=', '+', '-', '±', '*', '/', toRight ? ')' : '(']
	return findCharacterAtZeroBracketCount(value, cursor, endOfFactorCharacters, toRight, atLeastOneCharacter)
}

export function findEndOfExponent(value: InputValuePart[], cursor: InputCursorEnd): InputCursorEnd {
	const endOfExponentCharacters = ['=', '+', '-', '±', '*', '/', ')', '^']
	return findCharacterAtZeroBracketCount(value, cursor, endOfExponentCharacters, true, true)
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
		if (typeof element !== 'string' && opensExternalGroup(element.type)) noteOpeningBracket({ part, cursor: 0 })
		if (!isTextPart(element)) return

		// Walk through the text part.
		const str = element
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
