import { InterpretationError, findNextOf } from '@step-wise/utils'
import { type InputCursorEnd, type InterpretationSettings, getEndCursor, getStartCursor, getSubExpression, isExpressionPart, moveRight, sameCursor } from '@step-wise/math-input-value'

import { ExpressionNode, Integer, PlusMinus, Product, Sum } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'

// Interpret pluses, minuses and plus-minuses in an expression with some already-interpreted ExpressionNodes but without brackets.
export function interpretSums(value: IntermediateInterpretationPart[], settings: InterpretationSettings, context: InterpreterContext): ExpressionNode {
	// Set up a handler to add terms to the sum.
	const terms: ExpressionNode[] = []
	let symbolBefore = ''
	const addTerm = (start: InputCursorEnd, end: InputCursorEnd, symbolBefore: string) => {
		if (sameCursor(start, end)) return // Don't add things if the start and the end collide. (Like with a minus at the start of "-3x".)
		let expression = context.interpretProducts(getSubExpression<ExpressionNode>(value, start, end), settings, context)
		if (symbolBefore === '-') expression = new Product([Integer.minusOne, expression])
		if (symbolBefore === '±') expression = new Product([new PlusMinus(), expression])
		terms.push(expression)
	}

	// Walk through all expression parts, find pluses and minuses, and split the expressions up there.
	let start = getStartCursor(value)
	value.forEach((element, part) => {
		if (!isExpressionPart(element)) return
		const str = element.value
		const getNextPlusMinus = (startFrom = -1) => findNextOf(str, ['+', '-', '±'], startFrom + 1)
		for (let nextPlusMinus = getNextPlusMinus(); nextPlusMinus !== -1; nextPlusMinus = getNextPlusMinus(nextPlusMinus)) {
			let symbolAfter = str[nextPlusMinus]
			let end = { part, cursor: nextPlusMinus }

			// Run checks: no plus at the start, and notwo consecutive pluses/minuses, although "+-" like in "x+-3" is allowed.
			if (end.part === 0 && end.cursor === 0 && symbolAfter === '+') throw new InterpretationError('Could not interpret the Expression due to it starting with a plus.', 'PlusAtStart', '+')
			if (sameCursor(start, end) && (symbolBefore === symbolAfter || symbolAfter === '+')) throw new InterpretationError('Could not interpret the Expression due to a double plus/minus.', 'DoublePlusMinus', `${symbolBefore}${symbolAfter}`)

			// If we have "2+-3", "2±-3", "2-±3" or similar, jump over the second plus/minus character and incorporate it into the string to be interpreted.
			if (sameCursor(start, end)) {
				nextPlusMinus = getNextPlusMinus(nextPlusMinus)
				if (nextPlusMinus === -1) break
				symbolAfter = str[nextPlusMinus]
				end = { part, cursor: nextPlusMinus }
			}

			// If there is a minus sign or plus/minus preceded by a times, ignore it here and incorporate the minus when dealing with the product.
			if ((symbolAfter === '-' || symbolAfter === '±') && str[nextPlusMinus - 1] === '*') continue

			// Extract the term, process it, and shift cursors.
			addTerm(start, end, symbolBefore)
			symbolBefore = symbolAfter
			start = moveRight(end)
		}
	})

	// Add the remaining part (assuming there's no plus or minus at the end).
	const end = getEndCursor(value)
	if (sameCursor(start, end) && symbolBefore) throw new InterpretationError(`Could not interpret the Expression due to it ending with "${symbolBefore}".`, 'PlusMinusAtEnd', symbolBefore)
	addTerm(start, end, symbolBefore)

	// Assemble the result in a sum.
	if (terms.length === 0) throw new Error('Sum interpreting error: wound up with an empty sum.')
	if (terms.length === 1) return terms[0]
	return new Sum(terms)
}
