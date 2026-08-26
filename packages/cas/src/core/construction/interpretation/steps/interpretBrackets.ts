import { InterpretationError, isLetter } from '@step-wise/js-utils'
import { type InputValuePart, getExpressionEnd, getTopLevelBracketMatches, getExpressionStart, sliceExpressionValue, isEmptyExpressionValue, isTextPart, shiftExpressionPositionRight } from '@step-wise/math-input-value'

import { ExpressionNode } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'
import { type TextFunctionName, textFunctionComponents, isTextFunction, isTextFunctionInterpreted } from '../textFunctionComponents'

import { interpretLogarithm } from './interpretConstruct'

// Interpret brackets, including regular brackets, text functions like sin(...), and logarithms with an external argument.
export function interpretBrackets(value: InputValuePart[], context: InterpreterContext): ExpressionNode {
	if (isEmptyExpressionValue(value)) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')

	// Walk through matching brackets and add each interpreted part in order.
	const bracketSets = getTopLevelBracketMatches(value)
	const result: IntermediateInterpretationPart[] = []
	let lastPosition = getExpressionStart(value)
	bracketSets.forEach(({ opening, closing }) => {
		const openingPart = value[opening.part]
		const end = { ...opening }

		// A logarithm construct contributes the opening bracket of its external argument.
		if (!isTextPart(openingPart)) {
			if (openingPart.type !== 'Logarithm') throw new InterpretationError(`Could not interpret construct "${openingPart.type}" as an opening bracket.`, 'UnknownFunction', openingPart.type)
			const precedingPart = value[opening.part - 1]
			if (!isTextPart(precedingPart)) throw new Error('Invalid logarithm position: a logarithm must be preceded by a text part.')

			result.push(...sliceExpressionValue(value, lastPosition, { part: opening.part - 1, cursor: precedingPart.length }))
			const argument = context.interpretBrackets(sliceExpressionValue(value, { part: opening.part + 1, cursor: 0 }, closing), context)
			result.push(interpretLogarithm(openingPart, argument, context))
			lastPosition = shiftExpressionPositionRight(closing)
			return
		}

		// Interpret regular brackets like sin(...) and x(...).
		const partBetweenBrackets = sliceExpressionValue(value, shiftExpressionPositionRight(opening), closing)
		const interpretedExpression = context.interpretBrackets(partBetweenBrackets, context)
		let movingCursor = end.cursor
		while (openingPart[movingCursor - 1] && isLetter(openingPart[movingCursor - 1])) movingCursor--
		const functionName = openingPart.substring(movingCursor, end.cursor)

		// If the function name is in the allowed text-function list, add it as a function node.
		if (isTextFunction(functionName) && isTextFunctionInterpreted(functionName, context.interpretationSettings)) {
			end.cursor -= functionName.length
			result.push(...sliceExpressionValue(value, lastPosition, end))
			result.push(new textFunctionComponents[functionName as TextFunctionName](interpretedExpression))
			lastPosition = shiftExpressionPositionRight(closing)
			return
		}

		// Otherwise keep it as an ordinary multiplication-like bracket.
		result.push(...sliceExpressionValue(value, lastPosition, end))
		result.push(interpretedExpression)
		lastPosition = shiftExpressionPositionRight(closing)
	})

	result.push(...sliceExpressionValue(value, lastPosition, getExpressionEnd(value)))
	return context.interpretSums(result, context)
}
