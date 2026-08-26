import { indexOfAnyCharacter, last, InterpretationError } from '@step-wise/js-utils'

import { opensExternalBracketGroup } from '../definitions'
import { type ExpressionPosition, type InputValuePart, isTextPart } from '../types'

export const roundBrackets = ['(', ')'] as const
export const squareBrackets = ['[', ']'] as const
export type BracketPair = typeof roundBrackets | typeof squareBrackets

type TargetSymbol = string | string[] | ((symbol: string | InputValuePart) => boolean)
type BracketMatch = { opening: ExpressionPosition, closing: ExpressionPosition }

// Walk through an expression and find a wanted character at net bracket count zero.
export function findPositionAtBracketDepthZero(value: InputValuePart[], cursor: ExpressionPosition, target: TargetSymbol, searchRight = true, skipStartingPosition = false, brackets: BracketPair = roundBrackets): ExpressionPosition {
	const isTarget = typeof target === 'function' ? target : (symbol: string | InputValuePart) => typeof symbol === 'string' && (Array.isArray(target) ? target : [target]).includes(symbol)

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
		return searchRight ? partIterator < value.length - 1 || cursorIterator < currentString.length : partIterator > 0 || cursorIterator > 0
	}
	const getNextSymbol = (): string | InputValuePart => {
		const currentString = getCurrentTextPart()
		if (searchRight) {
			if (cursorIterator === currentString.length) return value[partIterator + 1]
			return currentString[cursorIterator]
		}
		if (cursorIterator === 0) return value[partIterator - 1]
		return currentString[cursorIterator - 1]
	}
	const shiftCursor = () => {
		const currentString = getCurrentTextPart()
		if (searchRight) {
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
		if (bracketCount <= 0 && isTarget(nextSymbol) && (!skipStartingPosition || !isFirst)) return { part: partIterator, cursor: cursorIterator }

		// Adjust bracket count. Constructs with an external group count as a round opening bracket too.
		if (nextSymbol === brackets[0]) bracketCount += searchRight ? 1 : -1
		else if (nextSymbol === brackets[1]) bracketCount += searchRight ? -1 : 1
		if (typeof nextSymbol !== 'string' && opensExternalBracketGroup(nextSymbol.type) && brackets[0] === '(') bracketCount += searchRight ? 1 : -1

		// Move to the next symbol.
		shiftCursor()
		isFirst = false
	}

	return { part: partIterator, cursor: cursorIterator }
}

export function findClosingBracket(value: InputValuePart[], cursor: ExpressionPosition): ExpressionPosition {
	return findPositionAtBracketDepthZero(value, cursor, ')')
}

export function findEndOfFactor(value: InputValuePart[], cursor: ExpressionPosition, searchRight = true, skipStartingPosition = false): ExpressionPosition {
	const endOfFactorCharacters = ['=', '+', '-', '±', '*', '/', searchRight ? ')' : '(']
	return findPositionAtBracketDepthZero(value, cursor, endOfFactorCharacters, searchRight, skipStartingPosition)
}

export function findEndOfExponent(value: InputValuePart[], cursor: ExpressionPosition): ExpressionPosition {
	const endOfExponentCharacters = ['=', '+', '-', '±', '*', '/', ')', '^']
	return findPositionAtBracketDepthZero(value, cursor, endOfExponentCharacters, true, true)
}

// Return top-level matching brackets; nested brackets are assumed to match.
export function getTopLevelBracketMatches(value: InputValuePart[]): BracketMatch[] {
	const brackets: Partial<BracketMatch>[] = []
	const openingBrackets: { bracket: typeof roundBrackets[0] | typeof squareBrackets[0], position: ExpressionPosition }[] = []

	// Define handlers to register bracket positions.
	const noteOpeningBracket = (bracket: typeof roundBrackets[0] | typeof squareBrackets[0], position: ExpressionPosition) => {
		if (openingBrackets.length === 0) brackets.push({ opening: position })
		openingBrackets.push({ bracket, position })
	}
	const noteClosingBracket = (bracket: typeof roundBrackets[1] | typeof squareBrackets[1], position: ExpressionPosition) => {
		if (openingBrackets.length === 0) throw new InterpretationError('Could not interpret the expression due to a missing opening bracket.', 'UnmatchedClosingBracket', position)

		const openingBracket = last(openingBrackets)
		const expectedClosingBracket = openingBracket.bracket === roundBrackets[0] ? roundBrackets[1] : squareBrackets[1]
		if (bracket !== expectedClosingBracket) throw new InterpretationError('Could not interpret the expression part due to a missing closing bracket.', 'UnmatchedOpeningBracket', openingBracket.position)

		if (openingBrackets.length === 1) last(brackets).closing = position
		openingBrackets.pop()
	}

	// Walk through the expression to find the bracket pairs.
	value.forEach((element, part) => {
		// Check for special function that counts as opening bracket.
		if (typeof element !== 'string' && opensExternalBracketGroup(element.type)) noteOpeningBracket(roundBrackets[0], { part, cursor: 0 })
		if (!isTextPart(element)) return

		// Walk through the text part.
		const textPart = element
		const getNextBracket = (fromPosition = -1) => indexOfAnyCharacter(textPart, ['(', ')', '[', ']'], fromPosition + 1)
		for (let nextBracket = getNextBracket(); nextBracket !== -1; nextBracket = getNextBracket(nextBracket)) {
			const bracketPosition = { part, cursor: nextBracket }
			const bracket = textPart[nextBracket]
			if (bracket === roundBrackets[0] || bracket === squareBrackets[0]) noteOpeningBracket(bracket, bracketPosition)
			else noteClosingBracket(bracket as typeof roundBrackets[1] | typeof squareBrackets[1], bracketPosition)
		}
	})

	// Finalize the bracket pairing.
	if (openingBrackets.length > 0) throw new InterpretationError('Could not interpret the expression part due to a missing closing bracket.', 'UnmatchedOpeningBracket', last(openingBrackets).position)
	return brackets as BracketMatch[]
}
