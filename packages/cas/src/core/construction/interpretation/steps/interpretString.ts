import { InterpretationError, isLetter } from '@step-wise/utils'

import { type ExpressionNode } from '../../nodes'
import { asExpressionNode } from '../../creation'

import type { InterpreterContext } from '../types'

// Interpret a string like "a2.3bc" as [a, 2.3, b, c]. If multi-character variables are turned on, "a2.3bc" is not allowed, as the distinction between number and variable is not clear. In that case "23xy6" becomes the product of 23 and variable "xy6": leading numbers are multiplications, while trailing numbers are part of the variable.
export function interpretString(str: string, context: InterpreterContext): ExpressionNode[] {
	checkStringFormat(str)
	return context.interpretationSettings.multiCharacterVariables ? interpretStringWithMultiCharacterVariables(str) : interpretStringWithSingleCharacterVariables(str)
}

// Check that no illegal formats appear.
const regInvalidSymbols = new RegExp(`[^a-zα-ω0-9.∞]`, 'i')
const regSingleDecimalSeparator = new RegExp(`(([^0-9]\\.[^0-9])|(^\\.[^0-9])|([^0-9]\\.$))`) // Period without any numbers.
const regMultipleDecimalSeparator = new RegExp(`\\.[0-9]*\\.`) // Number with two periods.
function checkStringFormat(str: string): void {
	const invalidSymbolMatch = str.match(regInvalidSymbols)
	if (invalidSymbolMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'InvalidSymbol', invalidSymbolMatch[0])

	const singleDecimalSeparatorMatch = str.match(regSingleDecimalSeparator)
	if (singleDecimalSeparatorMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'SingleDecimalSeparator', singleDecimalSeparatorMatch[0])

	const multipleDecimalSeparatorMatch = str.match(regMultipleDecimalSeparator)
	if (multipleDecimalSeparatorMatch) throw new InterpretationError(`Could not interpret the string "${str}".`, 'MultipleDecimalSeparator', multipleDecimalSeparatorMatch[0])
}

// In the single-character variable case, walk through the string and add single characters as variables.
function interpretStringWithSingleCharacterVariables(str: string): ExpressionNode[] {
	let lastLetter = -1
	const factors: ExpressionNode[] = []
	for (let i = 0; i < str.length; i++) {
		if (isLetter(str[i]) || str[i] === '∞') {
			if (lastLetter < i - 1) factors.push(asExpressionNode(Number(str.substring(lastLetter + 1, i))))
			factors.push(asExpressionNode(str[i]))
			lastLetter = i
		}
	}
	if (lastLetter < str.length - 1) factors.push(asExpressionNode(Number(str.substring(lastLetter + 1))))
	return factors
}

// In the multi-character case, turn leading numbers into numbers and everything else into one large variable.
const variableStart = `a-zα-ω`
const variableRest = `${variableStart}0-9`
const regMultiCharacterToken = new RegExp(`[0-9]+(?:\\.[0-9]+)?|\\.[0-9]+|∞|[${variableStart}][${variableRest}]*`, 'gi')
function interpretStringWithMultiCharacterVariables(str: string): ExpressionNode[] {
	const matches = [...str.matchAll(regMultiCharacterToken)]
	if (matches.map(match => match[0]).join('') !== str) throw new InterpretationError(`Could not interpret the string "${str}".`, 'InvalidSymbol', getFirstUnmatchedPart(str, matches))
	return matches.map(match => asExpressionNode(isNumberString(match[0]) ? Number(match[0]) : match[0]))
}

function isNumberString(token: string): boolean {
	return /^[0-9]+(?:\.[0-9]+)?|\.[0-9]+$/.test(token)
}

function getFirstUnmatchedPart(str: string, matches: RegExpMatchArray[]): string {
	let index = 0
	for (const match of matches) {
		if (match.index !== index) return str.slice(index, match.index)
		index = (match.index ?? 0) + match[0].length
	}
	return str.slice(index)
}
