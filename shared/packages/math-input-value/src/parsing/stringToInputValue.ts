import { findNextOf, removeWhitespace, isLetter, mergeDefaults, first, last } from '@step-wise/utils'

import { defaultInterpretationSettings, InterpretationSettings } from '../settings'
import type { ExpressionInputValue, SubSupInputValue, FunctionInputValue, InputCursorEnd, InputValuePart, SubscriptTextInputValue } from '../types'
import { getStartCursor, getEndCursor, getSubExpression, moveLeft, moveRight, mergeAdjacentExpressionParts, addExpressionType } from '../utils'

import { squareBrackets, findEndOfTerm, getMatchingBrackets, findCharacterAtZeroBracketCount } from './characterLocalization'
import { specialFunctionSettings, isSpecialFunction } from './functionDefinitions'
import { accents } from './accentDefinitions'

export function stringToInputValue(str: string, settings: InterpretationSettings): ExpressionInputValue {
	return addExpressionType(stringToInputValueParts(str, settings))
}

function stringToInputValueParts(str: string, settings: InterpretationSettings): InputValuePart[] {
	return processExpression([{ type: 'ExpressionPart', value: removeWhitespace(str) }], settings)
}

function processExpression(value: InputValuePart[], settings: InterpretationSettings): InputValuePart[] {
	value = processFunctionsAndAccents(value, settings)
	value = processSubSups(value, settings)
	value = processFractions(value, settings)
	return value
}

// Turn advanced functions like sqrt(x), log[10](x), root[3](x), and accents like dot(x) into objects.
function processFunctionsAndAccents(value: InputValuePart[], settings: InterpretationSettings): InputValuePart[] {
	const result: InputValuePart[] = []

	// Walk through the matching brackets.
	const bracketSets = getMatchingBrackets(value)
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet
		if (!closing || opening.cursor === undefined) return

		const openingElement = value[opening.part]
		if (openingElement.type !== 'ExpressionPart') return // If the opening bracket has already been processed, ignore it.
		if (openingElement.value[opening.cursor] === '[') return // If the opening bracket is a square bracket, ignore it.

		// Retrieve any potential optional arguments between square brackets.
		let end: InputCursorEnd = { part: opening.part, cursor: opening.cursor }
		let optionalArguments: InputValuePart[][] = []
		while (value[end.part].type === 'ExpressionPart' && end.cursor > 0 && value[end.part].value[end.cursor - 1] === ']') {
			end = moveLeft(end)
			const start = findCharacterAtZeroBracketCount(value, end, '[', false, false, squareBrackets)
			optionalArguments.push(getSubExpression(value, start, end))
			end = moveLeft(start)
		}
		const parsedOptionalArguments = optionalArguments.reverse().map(argument => addExpressionType(processExpression(argument, settings)))

		// Retrieve the function name by looking for the first non-letter character.
		const str = value[end.part].value as string
		let movingCursor = end.cursor
		while (movingCursor > 0 && isLetter(str[movingCursor - 1])) movingCursor--
		const functionName = str.substring(movingCursor, end.cursor)
		end = { ...end, cursor: movingCursor }

		// If the function name corresponds to an acceptable advanced function, apply it.
		if (isSpecialFunction(functionName)) {
			// Check the number of arguments and fill it up with defaults if there are too few.
			const functionSettings = specialFunctionSettings[functionName]
			const defaultOptionalArguments = functionSettings.defaultArguments.slice(1)
			const numOptionalArguments = defaultOptionalArguments.length
			if (parsedOptionalArguments.length > numOptionalArguments) throw new Error(`Invalid optional parameters: "${functionName}" received ${parsedOptionalArguments.length}, but allows at most ${numOptionalArguments}.`)
			let optionalArguments = defaultOptionalArguments.map((value, index) => parsedOptionalArguments[index] || value)

			// Add the part prior to the function.
			result.push(...getSubExpression(value, lastPosition, end))

			// Set up the function. If it needs to pull a parameter inside, like "root[3](dot(x))", then do so first.
			const partBetweenBrackets = getSubExpression(value, moveRight({ part: opening.part, cursor: opening.cursor }), closing)
			const hasParameterAfter = 'hasParameterAfter' in functionSettings && functionSettings.hasParameterAfter
			if (!hasParameterAfter) optionalArguments = [...optionalArguments, addExpressionType(processExpression(partBetweenBrackets, settings))]
			result.push({ type: 'Function', name: functionName, alias: `${functionName}(`, value: optionalArguments })

			// If the part between brackets has not been pulled inside, like for "log[10](dot(x))", process it separately.
			if (hasParameterAfter) result.push(...processFunctionsAndAccents(partBetweenBrackets, settings))

			// Adjust the cursor and continue.
			lastPosition = hasParameterAfter ? closing : moveRight(closing)
			return
		}

		// If the function name corresponds to an accent, apply it.
		if (accents.includes(functionName as typeof accents[number])) {
			if (parsedOptionalArguments.length > 0) throw new Error(`Invalid accent "${functionName}": accents cannot have optional parameters.`)
			result.push(...getSubExpression(value, lastPosition, end))
			if (opening.part !== closing.part) throw new Error(`Invalid accent "${functionName}": its parameter must be plain text.`)
			result.push({
				type: 'Accent',
				name: functionName,
				alias: `${functionName}(`,
				value: openingElement.value.substring(opening.cursor + 1, closing.cursor),
			})
			lastPosition = moveRight(closing)
			return
		}

		// No known advanced function or accent. If there were optional arguments, throw an error.
		if (parsedOptionalArguments.length > 0) throw new Error(`Invalid expression: "${functionName}" does not support optional parameters.`)

		// Basic functions and multiplication-like brackets stay text-like.
		result.push(...getSubExpression(value, lastPosition, moveRight({ part: opening.part, cursor: opening.cursor })))
		result.push(...processFunctionsAndAccents(getSubExpression(value, moveRight({ part: opening.part, cursor: opening.cursor }), closing), settings))
		lastPosition = closing
	})

	// Add the remaining part of the expression.
	result.push(...getSubExpression(value, lastPosition, getEndCursor(value)))
	return mergeAdjacentExpressionParts(result)
}

// Process _ and ^ into subSup functions.
function processSubSups(value: InputValuePart[], settings: InterpretationSettings): InputValuePart[] {
	return value.flatMap(part => processExpressionPartSubSups(part, settings))
}
function processExpressionPartSubSups(part: InputValuePart, settings: InterpretationSettings): InputValuePart[] {
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
			power = stringToInputValue(str.substring(position + 2, end), settings)
			position = end + 1
		} else {
			const match = str.substring(position + 1).match(/^-?[0-9.]+/)
			if (match) { // Number power: x^3.14. Use full number.
				power = stringToInputValue(match[0], settings)
				position += 1 + match[0].length
			} else { // No number power: x^abc. Use one symbol: x^a.
				power = stringToInputValue(str[position + 1], settings)
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

// Turn slashes into frac functions.
function processFractions(value: InputValuePart[], settings: InterpretationSettings): InputValuePart[] {
	// Set up a handler that finds the next slash symbol.
	const findNextSlash = () => {
		const part = value.findIndex(part => part.type === 'ExpressionPart' && part.value.includes('/'))
		return part === -1 ? undefined : { part, cursor: (value[part] as { type: 'ExpressionPart', value: string }).value.indexOf('/') }
	}

	// Walk through the slashes and apply them.
	for (let nextSymbol = findNextSlash(); nextSymbol; nextSymbol = findNextSlash()) value = applyFraction(value, nextSymbol, settings)
	return value
}
function applyFraction(value: InputValuePart[], cursor: InputCursorEnd, settings: InterpretationSettings): InputValuePart[] {
	// Define cursors.
	const start = getStartCursor(value)
	const beforeSymbol = cursor
	const afterSymbol = moveRight(cursor)
	const leftSide = findEndOfTerm(value, beforeSymbol, false)
	const rightSide = findEndOfTerm(value, afterSymbol, true, true)
	const end = getEndCursor(value)

	// Set up the fraction.
	const numerator = processExpression(getSubExpression(value, leftSide, beforeSymbol), settings)
	const denominator = processExpression(getSubExpression(value, afterSymbol, rightSide), settings)
	const fractionElement = {
		type: 'Function',
		name: 'frac',
		value: [
			addExpressionType(removeSurroundingBrackets(numerator)),
			addExpressionType(removeSurroundingBrackets(denominator)),
		],
	} as FunctionInputValue

	// Add parts before/after the fraction.
	return [
		...getSubExpression(value, start, leftSide),
		fractionElement,
		...getSubExpression(value, rightSide, end),
	]
}

// Find the matching closing bracket in a string.
function getBracketEnd(str: string, from: number): number {
	if (str[from] !== '(') throw new Error(`Invalid getBracketEnd call: expected "(" at index ${from} in "${str}".`)

	// Walk through all brackets and find when the right closing bracket is found.
	let counter = 0
	let nextBracket = findNextOf(str, ['(', ')'], from)
	while (nextBracket !== -1) {
		counter += str[nextBracket] === '(' ? 1 : -1
		if (counter === 0) return nextBracket
		nextBracket = findNextOf(str, ['(', ')'], nextBracket + 1)
	}
	throw new Error('Invalid brackets: missing closing bracket.')
}

// Remove surrounding brackets from an expression value.
function removeSurroundingBrackets(value: InputValuePart[]): InputValuePart[] {
	// If there are no brackets at the start/end, do nothing.
	const start = first(value)
	if (start.type !== 'ExpressionPart' || start.value.slice(0, 1) !== '(') return value
	const end = last(value)
	if (end.type !== 'ExpressionPart' || end.value.slice(-1) !== ')') return value

	// Remove the brackets.
	if (start === end) return [{ ...start, value: start.value.slice(1, -1) }]
	return [
		{ ...start, value: start.value.slice(1) },
		...value.slice(1, -1),
		{ ...end, value: end.value.slice(0, -1) },
	]
}
