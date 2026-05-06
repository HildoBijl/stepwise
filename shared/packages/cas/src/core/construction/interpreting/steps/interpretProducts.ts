import { InterpretationError } from '@step-wise/utils'
import { type InputCursorEnd, type InterpretationSettings, getExpressionPartValue, getEndCursor, getStartCursor, getSubExpression, isExpressionPart, moveRight, equalCursor } from '@step-wise/math-input-value'

import { ExpressionNode, Integer, PlusMinus, Product } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'

// Interpret explicit products split by *, in an expression with partly interpreted parts and no brackets.
export function interpretProducts(value: IntermediateInterpretationPart[], settings: InterpretationSettings, context: InterpreterContext): ExpressionNode {
	// Set up a handler to add factors to the product.
	const factors: ExpressionNode[] = []
	const addFactor = (start: InputCursorEnd, end: InputCursorEnd) => {
		const firstChar = getExpressionPartValue(value[start.part])[start.cursor]
		const minusAfterTimes = firstChar === '-' || firstChar === '±'
		const shiftedStart = minusAfterTimes ? moveRight(start) : start
		let expression = context.interpretStringsAndElements(getSubExpression<ExpressionNode>(value, shiftedStart, end), settings, context)
		if (minusAfterTimes) expression = firstChar === '-' ? new Product([Integer.minusOne, expression]) : new Product([new PlusMinus(), expression])
		factors.push(expression)
	}

	// Walk through all expression parts, find times operators, and split the expressions up there.
	let start = getStartCursor(value)
	value.forEach((element, part) => {
		if (!isExpressionPart(element)) return
		const str = element.value
		const getNextTimes = (startFrom = -1) => str.indexOf('*', startFrom + 1)
		for (let nextTimes = getNextTimes(); nextTimes !== -1; nextTimes = getNextTimes(nextTimes)) {
			const end = { part, cursor: nextTimes }

			// Run checks: no times at the start, and no double times.
			if (end.part === 0 && end.cursor === 0) throw new InterpretationError('Could not interpret the Expression due to it starting with a times operator.', 'TimesAtStart', '*')
			if (equalCursor(start, end)) throw new InterpretationError('Could not interpret the Expression due to a double times operator.', 'DoubleTimes', '**')

			// Extract, interpret and add the expression.
			addFactor(start, end)
			start = moveRight(end)
		}
	})

	// Add the remaining part (assuming there's no times symbol at the end).
	const end = getEndCursor(value)
	if (equalCursor(start, end)) throw new InterpretationError('Could not interpret the Expression due to it ending with a times operator.', 'TimesAtEnd', '*')
	addFactor(start, end)

	// Assemble the result in a product.
	if (factors.length === 0) throw new Error('Product interpreting error: wound up with an empty product.')
	if (factors.length === 1) return factors[0]
	return new Product(factors)
}
