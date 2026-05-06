import { isLetter } from '@step-wise/utils'

import { InterpretationSettings } from '../../settings'
import type { InputValuePart, ExpressionInputValue, InputCursorEnd } from '../../types'
import { accents, specialFunctionSettings, isSpecialFunction } from '../../definitions'
import { getStartCursor, getEndCursor, getSubExpression, moveLeft, moveRight, mergeAdjacentExpressionParts } from '../../utils'

import { squareBrackets, getMatchingBrackets, findCharacterAtZeroBracketCount } from '../support'

// Turn advanced functions like sqrt(x), log[10](x), root[3](x), and accents like dot(x) into corresponding objects.
export function processFunctionsAndAccents(value: InputValuePart[], settings: InterpretationSettings, processExpressionValue: (value: InputValuePart[], settings: InterpretationSettings) => ExpressionInputValue): InputValuePart[] {
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
		const parsedOptionalArguments = optionalArguments.reverse().map(argument => processExpressionValue(argument, settings))

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
			if (!hasParameterAfter) optionalArguments = [...optionalArguments, processExpressionValue(partBetweenBrackets, settings)]
			result.push({ type: 'Function', name: functionName, alias: `${functionName}(`, value: optionalArguments })

			// If the part between brackets has not been pulled inside, like for "log[10](dot(x))", process it separately.
			if (hasParameterAfter) result.push(...processFunctionsAndAccents(partBetweenBrackets, settings, processExpressionValue))

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
		result.push(...processFunctionsAndAccents(getSubExpression(value, moveRight({ part: opening.part, cursor: opening.cursor }), closing), settings, processExpressionValue))
		lastPosition = closing
	})

	// Add the remaining part of the expression.
	result.push(...getSubExpression(value, lastPosition, getEndCursor(value)))
	return mergeAdjacentExpressionParts(result)
}
