import { indexOfAnyCharacter, InterpretationError } from '@step-wise/js-utils'

import { type InterpretationSettings } from '../../settings/index.ts'
import type { ExpressionValue, InputValuePart, SubSupInputValue } from '../../types/index.ts'

// Turn underscores and power symbols in text parts into SubSup constructs. Existing constructs pass through unchanged.
export function parseSubSups(value: ExpressionValue, settings: InterpretationSettings, parseExpressionString: (source: string, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	return value.flatMap(part => parseSubSupsInTextPart(part, settings, parseExpressionString))
}

function parseSubSupsInTextPart(part: InputValuePart, settings: InterpretationSettings, parseExpressionString: (source: string, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	if (typeof part !== 'string') return [part]

	const result: ExpressionValue = []
	let position = 0
	let previousPosition = 0

	// Find the next subscript or superscript symbol from the current parsing position.
	const findNextSymbol = () => position = indexOfAnyCharacter(part, ['_', '^'], position)

	const getSubscript = (): string => {
		let subscript: string

		// In x_(...), take all text between the brackets. In x_1, take only the single character after the underscore.
		if (part[position + 1] === '(') {
			const end = findClosingParenthesisIndex(part, position + 1)
			subscript = part.substring(position + 2, end)
			position = end + 1
		} else {
			if (position + 1 >= part.length) throw new InterpretationError('Could not interpret the expression due to a subscript with no character after it.', 'EmptySubscript', position)
			subscript = part[position + 1]
			position += 2
		}
		return subscript
	}

	const getSuperscript = (): ExpressionValue => {
		let superscript: ExpressionValue

		// Bracketed superscripts may contain full nested expressions.
		if (part[position + 1] === '(') {
			const end = findClosingParenthesisIndex(part, position + 1)
			superscript = parseExpressionString(part.substring(position + 2, end), settings)
			position = end + 1
		} else {
			// Unbracketed numeric powers consume the complete number, including a possible minus sign and decimal part.
			const match = part.substring(position + 1).match(/^-?(?:\d+(?:\.\d*)?|\.\d+)/)
			if (match) {
				superscript = parseExpressionString(match[0], settings)
				position += 1 + match[0].length
			} else {
				// Other unbracketed powers consume only one symbol: x^abc becomes x^a followed by bc.
				if (position + 1 >= part.length) throw new InterpretationError('Could not interpret the expression due to a superscript with no character after it.', 'EmptySuperscript', position)
				superscript = parseExpressionString(part[position + 1], settings)
				position += 2
			}
		}
		return superscript
	}

	findNextSymbol()
	while (position !== -1) {
		// Keep the text preceding the symbol, then consume the SubSup fields in either _^ or ^_ order.
		result.push(part.substring(previousPosition, position))
		const subSup: SubSupInputValue = { type: 'SubSup' }
		if (part[position] === '_') {
			subSup.subscript = getSubscript()
			if (part[position] === '^') subSup.superscript = getSuperscript()
		} else {
			subSup.superscript = getSuperscript()
			if (part[position] === '_') subSup.subscript = getSubscript()
		}
		result.push(subSup)
		previousPosition = position
		findNextSymbol()
	}

	// Keep the text remaining after the final SubSup.
	result.push(part.substring(previousPosition))
	return result
}

function findClosingParenthesisIndex(source: string, openingIndex: number): number {
	if (source[openingIndex] !== '(') throw new Error(`Invalid findClosingParenthesisIndex call: expected "(" at index ${openingIndex} in "${source}".`)

	// Walk through nested brackets, returning when the bracket at `openingIndex` is balanced.
	let counter = 0
	let nextBracket = indexOfAnyCharacter(source, ['(', ')'], openingIndex)
	while (nextBracket !== -1) {
		counter += source[nextBracket] === '(' ? 1 : -1
		if (counter === 0) return nextBracket
		nextBracket = indexOfAnyCharacter(source, ['(', ')'], nextBracket + 1)
	}
	throw new Error('Invalid brackets: missing closing bracket.')
}
