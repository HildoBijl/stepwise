import { InterpretationError, isLetter } from '@step-wise/utils'
import { type FunctionInputValue, type InputValuePart, type InterpretationSettings, getExpressionPartValue, getEndCursor, getMatchingBrackets, getStartCursor, getSubExpression, isEmptyExpressionValue, isExpressionPart, moveRight } from '@step-wise/math-input-value'

import { ExpressionNode } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'
import { type BasicFunctionName, basicFunctionComponents } from '../functionComponents'

// Interpret brackets, including regular brackets, basic functions like sin(...), and special functions with a parameter after like log[...](...).
export function interpretBrackets(value: InputValuePart[], settings: InterpretationSettings, context: InterpreterContext): ExpressionNode {
	if (isEmptyExpressionValue(value)) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')

	// Walk through matching brackets and add each part accordingly.
	const bracketSets = getMatchingBrackets(value)
	const result: IntermediateInterpretationPart[] = []
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet
		const end = { ...opening }

		// Interpret opening brackets from special functions with brackets like log[10](...).
		if (value[opening.part].type === 'Function') {
			// Interpret the part prior to the function.
			const part = end.part - 1
			result.push(...getSubExpression(value, lastPosition, { part, cursor: isExpressionPart(value[part]) ? value[part].value.length : 0 }))

			// Interpret the special function.
			const element = value[opening.part] as FunctionInputValue
			const externalArgument = context.interpretBrackets(getSubExpression(value, { part: opening.part + 1, cursor: 0 }, closing), settings, context)
			const internalArguments = element.value.map(expression => context.interpretBrackets(expression.value, settings, context))
			result.push(context.interpretSpecialFunctionWithParameterAfter(element.name, externalArgument, internalArguments, settings, context))

			// Shift the cursor.
			lastPosition = moveRight(closing)
			return
		}

		// Interpret regular brackets like sin(...) and x(...).
		const partBetweenBrackets = getSubExpression(value, moveRight(opening), closing)
		const interpretedExpression = context.interpretBrackets(partBetweenBrackets, settings, context)
		const str = getExpressionPartValue(value[end.part])
		let movingCursor = end.cursor
		while (str[movingCursor - 1] && isLetter(str[movingCursor - 1])) movingCursor--
		const functionName = str.substring(movingCursor, end.cursor)

		// If the function name is in the allowed function list, add it.
		if (functionName in basicFunctionComponents) {
			end.cursor -= functionName.length
			result.push(...getSubExpression(value, lastPosition, end))
			result.push(new basicFunctionComponents[functionName as BasicFunctionName](interpretedExpression))
			lastPosition = moveRight(closing)
			return
		}

		// If custom functions are allowed, add as a function.
		if (settings.customFunctions) throw new Error(`Invalid interpretation settings: the custom functions option has not been implemented yet.`)

		// Add as a regular bracket.
		result.push(...getSubExpression(value, lastPosition, end))
		result.push(interpretedExpression)
		lastPosition = moveRight(closing)
	})

	// Add the remainder. Then continue processing.
	result.push(...getSubExpression(value, lastPosition, getEndCursor(value)))
	return context.interpretSums(result, settings, context)
}
