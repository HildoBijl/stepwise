import { InterpretationError, isLetter } from '@step-wise/utils'

import { ExpressionNode, Variable } from '../../nodes'
import { asExpressionNode } from '../../creation'

// Interpret a string like "a2.3bc" as [a, 2.3, b, c].
const regInvalidSymbols = new RegExp(`[^a-zα-ω0-9.∞]`, 'i')
const regSingleDecimalSeparator = new RegExp(`(([^0-9]\\.[^0-9])|(^\\.[^0-9])|([^0-9]\\.$))`) // Period without any numbers.
const regMultipleDecimalSeparator = new RegExp(`\\.[0-9]*\\.`) // Number with two periods.
export function interpretString(str: string): ExpressionNode[] {
	// Check for invalid formats.
	const invalidSymbolMatch = str.match(regInvalidSymbols)
	if (invalidSymbolMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'InvalidSymbol', invalidSymbolMatch[0])
	const singleDecimalSeparatorMatch = str.match(regSingleDecimalSeparator)
	if (singleDecimalSeparatorMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'SingleDecimalSeparator', singleDecimalSeparatorMatch[0])
	const multipleDecimalSeparatorMatch = str.match(regMultipleDecimalSeparator)
	if (multipleDecimalSeparatorMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'MultipleDecimalSeparator', multipleDecimalSeparatorMatch[0])

	// Walk through the string and add all characters.
	let lastLetter = -1
	const terms: ExpressionNode[] = []
	for (let i = 0; i < str.length; i++) {
		if (isLetter(str[i]) || str[i] === '∞') {
			if (lastLetter < i - 1) terms.push(asExpressionNode(Number(str.substring(lastLetter + 1, i))))
			terms.push(new Variable(str[i]))
			lastLetter = i
		}
	}
	if (lastLetter < str.length - 1) terms.push(asExpressionNode(Number(str.substring(lastLetter + 1))))
	return terms
}
