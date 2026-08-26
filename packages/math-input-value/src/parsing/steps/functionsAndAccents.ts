import { isLetter } from '@step-wise/js-utils'

import { type InterpretationSettings } from '../../settings'
import { accents, constructDefinitions, getConstructTypeFromAlias } from '../../definitions'
import { type ExpressionValue, type InputCursorEnd, isTextPart } from '../../types'
import { getStartCursor, getEndCursor, getSubExpression, shiftPositionLeft, shiftPositionRight, mergeAdjacentTextParts } from '../../utils'

import { squareBrackets, getMatchingBrackets, findCharacterAtZeroBracketCount } from '../support'

// Turn occurrences of brackets (when relevant) into constructs, like roots, logarithms and accents.
export function processFunctionsAndAccents(value: ExpressionValue, settings: InterpretationSettings, processExpression: (value: ExpressionValue, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	const result: ExpressionValue = []
	const bracketSets = getMatchingBrackets(value)
	let lastPosition = getStartCursor(value)

	// Walk through the brackets to turn them into functions/accents.
	bracketSets.forEach(({ opening, closing }) => {
		if (!closing || opening.cursor === undefined) return
		const openingText = value[opening.part]
		if (!isTextPart(openingText) || openingText[opening.cursor] === '[') return

		// Retrieve optional arguments between square brackets, working backwards from the opening round bracket.
		let end: InputCursorEnd = { part: opening.part, cursor: opening.cursor }
		const optionalArguments: ExpressionValue[] = []
		while (true) {
			const optionalArgumentEndPart = value[end.part]
			if (!isTextPart(optionalArgumentEndPart) || end.cursor <= 0 || optionalArgumentEndPart[end.cursor - 1] !== ']') break
			end = shiftPositionLeft(end)
			const start = findCharacterAtZeroBracketCount(value, end, '[', false, false, squareBrackets)
			optionalArguments.push(getSubExpression(value, start, end) as ExpressionValue)
			end = shiftPositionLeft(start)
		}
		const parsedOptionalArguments = optionalArguments.reverse().map(argument => processExpression(argument, settings))

		// Retrieve the function name immediately preceding the bracket.
		const functionNamePart = value[end.part]
		if (!isTextPart(functionNamePart)) throw new Error('Invalid function: its name must be stored in a text part.')
		let movingCursor = end.cursor
		while (movingCursor > 0 && isLetter(functionNamePart[movingCursor - 1])) movingCursor--
		const functionName = functionNamePart.substring(movingCursor, end.cursor)
		const alias = `${functionName}(`
		end = { ...end, cursor: movingCursor }

		// On a recognized construct, apply it.
		const constructType = getConstructTypeFromAlias(alias)
		if (constructType === 'SquareRoot' || constructType === 'Root' || constructType === 'Logarithm') {
			const maxOptionalArguments = constructType === 'SquareRoot' ? 0 : 1
			if (parsedOptionalArguments.length > maxOptionalArguments) throw new Error(`Invalid optional parameters: "${functionName}" received ${parsedOptionalArguments.length}, but allows at most ${maxOptionalArguments}.`)
			result.push(...getSubExpression(value, lastPosition, end) as ExpressionValue)

			const innerValue = getSubExpression(value, shiftPositionRight(opening), closing) as ExpressionValue
			if (constructType === 'SquareRoot') {
				result.push({ type: 'SquareRoot', alias, radicand: processExpression(innerValue, settings) })
				lastPosition = shiftPositionRight(closing)
			} else if (constructType === 'Root') {
				result.push({ type: 'Root', alias, degree: parsedOptionalArguments[0] || [constructDefinitions.Root.defaultDegree], radicand: processExpression(innerValue, settings) })
				lastPosition = shiftPositionRight(closing)
			} else {
				result.push({ type: 'Logarithm', alias, base: parsedOptionalArguments[0] || [constructDefinitions.Logarithm.defaultBase] })
				result.push(...processFunctionsAndAccents(innerValue, settings, processExpression))
				lastPosition = closing
			}
			return
		}

		// On a recognized accent, apply it.
		if (accents.includes(functionName as typeof accents[number])) {
			if (parsedOptionalArguments.length > 0) throw new Error(`Invalid accent "${functionName}": accents cannot have optional parameters.`)
			if (opening.part !== closing.part) throw new Error(`Invalid accent "${functionName}": its parameter must be plain text.`)
			result.push(...getSubExpression(value, lastPosition, end) as ExpressionValue)
			result.push({ type: 'Accent', name: functionName as typeof accents[number], alias, value: openingText.substring(opening.cursor + 1, closing.cursor) })
			lastPosition = shiftPositionRight(closing)
			return
		}

		// Keep remaining functions text-like.
		if (parsedOptionalArguments.length > 0) throw new Error(`Invalid expression: "${functionName}" does not support optional parameters.`)
		result.push(...getSubExpression(value, lastPosition, shiftPositionRight(opening)) as ExpressionValue)
		result.push(...processFunctionsAndAccents(getSubExpression(value, shiftPositionRight(opening), closing) as ExpressionValue, settings, processExpression))
		lastPosition = closing
	})

	// Add the remainder of the expression.
	result.push(...getSubExpression(value, lastPosition, getEndCursor(value)) as ExpressionValue)
	return mergeAdjacentTextParts(result)
}
