import { InterpretationError, isLetter } from '@step-wise/utils'
import { type InputValuePart, getEndCursor, getMatchingBrackets, getStartCursor, getSubExpression, isEmptyExpressionValue, isTextPart, shiftPositionRight } from '@step-wise/math-input-value'

import { ExpressionNode } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'
import { type TextFunctionName, textFunctionComponents, isTextFunction, isTextFunctionInterpreted } from '../textFunctionComponents'

import { interpretLogarithm } from './interpretConstruct'

// Interpret brackets, including regular brackets, text functions like sin(...), and logarithms with an external argument.
export function interpretBrackets(value: InputValuePart[], context: InterpreterContext): ExpressionNode {
	if (isEmptyExpressionValue(value)) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')

	// Walk through matching brackets and add each interpreted part in order.
	const bracketSets = getMatchingBrackets(value)
	const result: IntermediateInterpretationPart[] = []
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(({ opening, closing }) => {
		const openingPart = value[opening.part]
		const end = { ...opening }

		// A logarithm construct contributes the opening bracket of its external argument.
		if (!isTextPart(openingPart)) {
			if (openingPart.type !== 'Logarithm') throw new InterpretationError(`Could not interpret construct "${openingPart.type}" as an opening bracket.`, 'UnknownFunction', openingPart.type)
			const precedingPart = value[opening.part - 1]
			if (!isTextPart(precedingPart)) throw new Error('Invalid logarithm position: a logarithm must be preceded by a text part.')

			result.push(...getSubExpression(value, lastPosition, { part: opening.part - 1, cursor: precedingPart.length }))
			const argument = context.interpretBrackets(getSubExpression(value, { part: opening.part + 1, cursor: 0 }, closing), context)
			result.push(interpretLogarithm(openingPart, argument, context))
			lastPosition = shiftPositionRight(closing)
			return
		}

		// Interpret regular brackets like sin(...) and x(...).
		const partBetweenBrackets = getSubExpression(value, shiftPositionRight(opening), closing)
		const interpretedExpression = context.interpretBrackets(partBetweenBrackets, context)
		let movingCursor = end.cursor
		while (openingPart[movingCursor - 1] && isLetter(openingPart[movingCursor - 1])) movingCursor--
		const functionName = openingPart.substring(movingCursor, end.cursor)

		// If the function name is in the allowed text-function list, add it as a function node.
		if (isTextFunction(functionName) && isTextFunctionInterpreted(functionName, context.interpretationSettings)) {
			end.cursor -= functionName.length
			result.push(...getSubExpression(value, lastPosition, end))
			result.push(new textFunctionComponents[functionName as TextFunctionName](interpretedExpression))
			lastPosition = shiftPositionRight(closing)
			return
		}

		// Otherwise keep it as an ordinary multiplication-like bracket.
		result.push(...getSubExpression(value, lastPosition, end))
		result.push(interpretedExpression)
		lastPosition = shiftPositionRight(closing)
	})

	result.push(...getSubExpression(value, lastPosition, getEndCursor(value)))
	return context.interpretSums(result, context)
}
