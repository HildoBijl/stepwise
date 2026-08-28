import { InterpretationError } from '@step-wise/js-utils'
import { type ExpressionTextCursor, getExpressionEndCursor, getExpressionStartCursor, sliceExpressionValue, isTextPart, shiftExpressionTextCursorRight, areExpressionTextCursorsEqual } from '@step-wise/math-input-value'

import { ExpressionNode, Minus, PlusMinus, Product } from '../../nodes/index.ts'

import type { InterpretationPart, InterpreterContext } from '../types.ts'

// Interpret explicit products split by *, in an expression with partly interpreted parts and no brackets.
export function interpretProducts(value: InterpretationPart[], context: InterpreterContext): ExpressionNode {
	// Set up a handler to add factors to the product.
	const factors: ExpressionNode[] = []
	const addFactor = (start: ExpressionTextCursor, end: ExpressionTextCursor) => {
		const startPart = value[start.part]
		if (!isTextPart(startPart)) throw new Error('A factor must start in a text part.')
		const firstChar = startPart[start.cursor]
		const minusAfterTimes = firstChar === '-' || firstChar === '±'
		const shiftedStart = minusAfterTimes ? shiftExpressionTextCursorRight(start) : start
		let expression = context.interpretParts(sliceExpressionValue<ExpressionNode>(value, shiftedStart, end), context)
		if (minusAfterTimes) {
			if (firstChar === '-') expression = new Minus(expression)
			else if (firstChar === '±') expression = new PlusMinus(expression)
			else throw new Error(`Impossible case in expression interpretation: unknown character "${firstChar}".`)
		}
		factors.push(expression)
	}

	// Walk through all expression parts, find times operators, and split the expressions up there.
	let start = getExpressionStartCursor<ExpressionNode>(value)
	value.forEach((element, part) => {
		if (!isTextPart(element)) return
		const str = element
		const getNextTimes = (startFrom = -1) => str.indexOf('*', startFrom + 1)
		for (let nextTimes = getNextTimes(); nextTimes !== -1; nextTimes = getNextTimes(nextTimes)) {
			const end = { part, cursor: nextTimes }

			// Run checks: no times at the start, and no double times.
			if (end.part === 0 && end.cursor === 0) throw new InterpretationError('Could not interpret the Expression due to it starting with a times operator.', 'TimesAtStart', '*')
			if (areExpressionTextCursorsEqual(start, end)) throw new InterpretationError('Could not interpret the Expression due to a double times operator.', 'DoubleTimes', '**')

			// Extract, interpret and add the expression.
			addFactor(start, end)
			start = shiftExpressionTextCursorRight(end)
		}
	})

	// Add the remaining part (assuming there's no times symbol at the end).
	const end = getExpressionEndCursor<ExpressionNode>(value)
	if (areExpressionTextCursorsEqual(start, end)) throw new InterpretationError('Could not interpret the Expression due to it ending with a times operator.', 'TimesAtEnd', '*')
	addFactor(start, end)

	// Assemble the result in a product.
	if (factors.length === 0) throw new Error('Product interpreting error: wound up with an empty product.')
	if (factors.length === 1) return factors[0]
	return new Product(factors)
}
