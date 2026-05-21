import { InterpretationError } from '@step-wise/utils'
import { isExpressionPart } from '@step-wise/math-input-value'

import { ExpressionNode, Product } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'

import { interpretElements } from './interpretElements'
import { interpretString } from './interpretString'

// Interpret strings, functions and accents that remain after brackets/sums/products.
export function interpretStringsAndElements(value: IntermediateInterpretationPart[], context: InterpreterContext): ExpressionNode {
	// Turn all ExpressionParts (strings) into arrays of interpreted elements. (Keep other elements, interpreted or not, as they are.)
	const interpretedParts = value.map(element => isExpressionPart(element) ? interpretString(element.value, context) : element).flat()

	// Interpret the remaining elements (accents, SubSup, special functions). This needs to be done after the interpreting of strings, in case of SubSups that need merging with the prior variable.
	const elements = interpretElements(interpretedParts, context)

	// Turn the result into one big product.
	if (elements.length === 0) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')
	if (elements.length === 1) return elements[0]
	return new Product(elements)
}
