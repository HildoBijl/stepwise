import { findNextOf } from '@step-wise/utils'

import { InterpretationSettings } from '../../settings'
import type { ExpressionInputValue, SubSupInputValue, InputValuePart, SubscriptTextInputValue } from '../../types'

// Process _ and ^ into subSup functions.
export function processSubSups(value: InputValuePart[], settings: InterpretationSettings, processExpressionString: (str: string, settings: InterpretationSettings) => ExpressionInputValue): InputValuePart[] {
	return value.flatMap(part => processExpressionPartSubSups(part, settings, processExpressionString))
}
function processExpressionPartSubSups(part: InputValuePart, settings: InterpretationSettings, processExpressionString: (str: string, settings: InterpretationSettings) => ExpressionInputValue): InputValuePart[] {
	if (part.type !== 'ExpressionPart') return [part]

	const str = part.value
	const result: InputValuePart[] = []
	let position = 0
	let previousPosition = 0

	// Set up handlers to find the next underscore/superscript symbol.
	const findNextSymbol = () => position = findNextOf(str, ['_', '^'], position)
	const getSubscript = (): SubscriptTextInputValue => {
		let subscriptText: string
		if (str[position + 1] === '(') { // On "x_(...)" process bracket contents.
			const end = str.indexOf(')', position)
			if (end === -1) throw new Error('Invalid subscript: missing closing bracket.')
			subscriptText = str.substring(position + 2, end)
			position = end + 1
		} else { // On "x_123" only take one character: x_1.
			subscriptText = str[position + 1]
			position += 2
		}
		return { type: 'SubscriptText', value: subscriptText }
	}
	const getSuperscript = (): ExpressionInputValue => {
		let power: ExpressionInputValue
		if (str[position + 1] === '(') {
			const end = getBracketEnd(str, position + 1)
			power = processExpressionString(str.substring(position + 2, end), settings)
			position = end + 1
		} else {
			const match = str.substring(position + 1).match(/^-?[0-9.]+/)
			if (match) { // Number power: x^3.14. Use full number.
				power = processExpressionString(match[0], settings)
				position += 1 + match[0].length
			} else { // No number power: x^abc. Use one symbol: x^a.
				power = processExpressionString(str[position + 1], settings)
				position += 2
			}
		}
		return power
	}

	// Walk through underscores and power symbols and process them appropriately.
	findNextSymbol()
	while (position !== -1) {
		// Add the part prior to the SubSup.
		result.push({ type: 'ExpressionPart', value: str.substring(previousPosition, position) })

		// Set up the subSup object and fill it in the right way.
		const subSup: SubSupInputValue = { type: 'Function', name: 'subSup', value: [] }
		if (str[position] === '_') {
			subSup.value[0] = getSubscript()
			if (str[position] === '^') subSup.value[1] = getSuperscript()
		} else {
			subSup.value[1] = getSuperscript()
			if (str[position] === '_') subSup.value[0] = getSubscript()
		}
		result.push(subSup)

		// Shift cursor and continue.
		previousPosition = position
		findNextSymbol()
	}

	// Add remaining contents.
	result.push({ type: 'ExpressionPart', value: str.substring(previousPosition) })
	return result
}

// Find the matching closing bracket in a string: walk through the brackets while keeping a depth count until the right one is found.
function getBracketEnd(str: string, from: number): number {
	if (str[from] !== '(') throw new Error(`Invalid getBracketEnd call: expected "(" at index ${from} in "${str}".`)
	let counter = 0
	let nextBracket = findNextOf(str, ['(', ')'], from)
	while (nextBracket !== -1) {
		counter += str[nextBracket] === '(' ? 1 : -1
		if (counter === 0) return nextBracket
		nextBracket = findNextOf(str, ['(', ')'], nextBracket + 1)
	}
	throw new Error('Invalid brackets: missing closing bracket.')
}
