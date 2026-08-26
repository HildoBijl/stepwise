import { isLetter } from '@step-wise/js-utils'

import { type InterpretationSettings } from '../../settings'
import { accentNames, constructDefinitions, getConstructTypeByAlias } from '../../definitions'
import { type ExpressionValue, type ExpressionTextCursor, isTextPart } from '../../types'
import { getExpressionStartCursor, getExpressionEndCursor, sliceExpressionValue, shiftExpressionTextCursorLeft, shiftExpressionTextCursorRight, mergeAdjacentTextParts } from '../../utils'

import { squareBrackets, getTopLevelBracketMatches, findCursorAtBracketDepthZero } from '../support'

// Turn occurrences of brackets (when relevant) into constructs, like roots, logarithms and accents.
export function parseFunctionsAndAccents(value: ExpressionValue, settings: InterpretationSettings, parseExpressionValue: (value: ExpressionValue, settings: InterpretationSettings) => ExpressionValue): ExpressionValue {
	const result: ExpressionValue = []
	const bracketMatches = getTopLevelBracketMatches(value)
	let lastCursor = getExpressionStartCursor(value)

	// Walk through the brackets to turn them into functions/accents.
	bracketMatches.forEach(({ opening, closing }) => {
		if (!closing || opening.cursor === undefined) return
		const openingText = value[opening.part]
		if (!isTextPart(openingText) || openingText[opening.cursor] === '[') return

		// Retrieve optional arguments between square brackets, working backwards from the opening round bracket.
		let end: ExpressionTextCursor = { part: opening.part, cursor: opening.cursor }
		const optionalArguments: ExpressionValue[] = []
		while (true) {
			const optionalArgumentEndPart = value[end.part]
			if (!isTextPart(optionalArgumentEndPart) || end.cursor <= 0 || optionalArgumentEndPart[end.cursor - 1] !== ']') break
			end = shiftExpressionTextCursorLeft(end)
			const start = findCursorAtBracketDepthZero(value, end, '[', false, false, squareBrackets)
			optionalArguments.push(sliceExpressionValue(value, start, end) as ExpressionValue)
			end = shiftExpressionTextCursorLeft(start)
		}
		const parsedOptionalArguments = optionalArguments.reverse().map(argument => parseExpressionValue(argument, settings))

		// Retrieve the function name immediately preceding the bracket.
		const functionNamePart = value[end.part]
		if (!isTextPart(functionNamePart)) throw new Error('Invalid function: its name must be stored in a text part.')
		let movingCursor = end.cursor
		while (movingCursor > 0 && isLetter(functionNamePart[movingCursor - 1])) movingCursor--
		const functionName = functionNamePart.substring(movingCursor, end.cursor)
		const alias = `${functionName}(`
		end = { ...end, cursor: movingCursor }

		// On a recognized construct, apply it.
		const constructType = getConstructTypeByAlias(alias)
		if (constructType === 'SquareRoot' || constructType === 'Root' || constructType === 'Logarithm') {
			const maxOptionalArguments = constructType === 'SquareRoot' ? 0 : 1
			if (parsedOptionalArguments.length > maxOptionalArguments) throw new Error(`Invalid optional parameters: "${functionName}" received ${parsedOptionalArguments.length}, but allows at most ${maxOptionalArguments}.`)
			result.push(...sliceExpressionValue(value, lastCursor, end) as ExpressionValue)

			const innerValue = sliceExpressionValue(value, shiftExpressionTextCursorRight(opening), closing) as ExpressionValue
			if (constructType === 'SquareRoot') {
				result.push({ type: 'SquareRoot', alias, radicand: parseExpressionValue(innerValue, settings) })
				lastCursor = shiftExpressionTextCursorRight(closing)
			} else if (constructType === 'Root') {
				result.push({ type: 'Root', alias, degree: parsedOptionalArguments[0] || [constructDefinitions.Root.defaultDegree], radicand: parseExpressionValue(innerValue, settings) })
				lastCursor = shiftExpressionTextCursorRight(closing)
			} else {
				result.push({ type: 'Logarithm', alias, base: parsedOptionalArguments[0] || [constructDefinitions.Logarithm.defaultBase] })
				result.push(...parseFunctionsAndAccents(innerValue, settings, parseExpressionValue))
				lastCursor = closing
			}
			return
		}

		// On a recognized accent, apply it.
		if (accentNames.includes(functionName as typeof accentNames[number])) {
			if (parsedOptionalArguments.length > 0) throw new Error(`Invalid accent "${functionName}": accents cannot have optional parameters.`)
			if (opening.part !== closing.part) throw new Error(`Invalid accent "${functionName}": its parameter must be plain text.`)
			result.push(...sliceExpressionValue(value, lastCursor, end) as ExpressionValue)
			result.push({ type: 'Accent', name: functionName as typeof accentNames[number], alias, value: openingText.substring(opening.cursor + 1, closing.cursor) })
			lastCursor = shiftExpressionTextCursorRight(closing)
			return
		}

		// Keep remaining functions text-like.
		if (parsedOptionalArguments.length > 0) throw new Error(`Invalid expression: "${functionName}" does not support optional parameters.`)
		result.push(...sliceExpressionValue(value, lastCursor, shiftExpressionTextCursorRight(opening)) as ExpressionValue)
		result.push(...parseFunctionsAndAccents(sliceExpressionValue(value, shiftExpressionTextCursorRight(opening), closing) as ExpressionValue, settings, parseExpressionValue))
		lastCursor = closing
	})

	// Add the remainder of the expression.
	result.push(...sliceExpressionValue(value, lastCursor, getExpressionEndCursor(value)) as ExpressionValue)
	return mergeAdjacentTextParts(result)
}
