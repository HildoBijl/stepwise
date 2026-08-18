import { indexOfAnyCharacter, InterpretationError } from '@step-wise/js-utils'

import { type InterpretationSettings } from '../../settings'
import type { ExpressionValue, InputValuePart, SubSupInputValue } from '../../types'

// Turn underscores and power symbols in text parts into SubSup constructs. Existing constructs pass through unchanged.
export function processSubSups(value: ExpressionValue, settings: InterpretationSettings, processExpressionString: (str: string, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	return value.flatMap(part => processExpressionPartSubSups(part, settings, processExpressionString))
}

function processExpressionPartSubSups(part: InputValuePart, settings: InterpretationSettings, processExpressionString: (str: string, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
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
			const end = part.indexOf(')', position)
			if (end === -1) throw new Error('Invalid subscript: missing closing bracket.')
			subscript = part.substring(position + 2, end)
			position = end + 1
		} else {
			subscript = part[position + 1]
			position += 2
		}
		return subscript
	}

	const getSuperscript = (): ExpressionValue => {
		let superscript: ExpressionValue

		// Bracketed superscripts may contain full nested expressions.
		if (part[position + 1] === '(') {
			const end = getBracketEnd(part, position + 1)
			superscript = processExpressionString(part.substring(position + 2, end), settings)
			position = end + 1
		} else {
			// Unbracketed numeric powers consume the complete number, including a possible minus sign and decimal part.
			const match = part.substring(position + 1).match(/^-?[0-9.]+/)
			if (match) {
				superscript = processExpressionString(match[0], settings)
				position += 1 + match[0].length
			} else {
				// Other unbracketed powers consume only one symbol: x^abc becomes x^a followed by bc.
				if (position + 1 >= part.length) throw new InterpretationError('Could not interpret the expression due to a superscript with no character after it.', 'EmptySuperscript', position)
				superscript = processExpressionString(part[position + 1], settings)
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

function getBracketEnd(str: string, from: number): number {
	if (str[from] !== '(') throw new Error(`Invalid getBracketEnd call: expected "(" at index ${from} in "${str}".`)

	// Walk through nested brackets, returning when the opening bracket at `from` is balanced.
	let counter = 0
	let nextBracket = indexOfAnyCharacter(str, ['(', ')'], from)
	while (nextBracket !== -1) {
		counter += str[nextBracket] === '(' ? 1 : -1
		if (counter === 0) return nextBracket
		nextBracket = indexOfAnyCharacter(str, ['(', ')'], nextBracket + 1)
	}
	throw new Error('Invalid brackets: missing closing bracket.')
}
