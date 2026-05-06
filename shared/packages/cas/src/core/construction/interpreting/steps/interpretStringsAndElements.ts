import { InterpretationError } from '@step-wise/utils'
import { type InterpretationSettings, isExpressionPart } from '@step-wise/math-input-value'

import { ExpressionNode, Product } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'

import { interpretElements } from './interpretElements'
import { interpretString } from './interpretString'

// Interpret strings, functions and accents that remain after brackets/sums/products.
export function interpretStringsAndElements(value: IntermediateInterpretationPart[], settings: InterpretationSettings, context: InterpreterContext): ExpressionNode {
	// Turn all ExpressionParts (strings) into arrays of interpreted elements. (Keep other elements, interpreted or not, as they are.)
	const interpretedParts = value.map(element => isExpressionPart(element) ? interpretString(element.value) : element).flat()

	// Interpret the remaining elements. This needs to be done after the interpreting of strings, in case of SubSups that need merging. Then turn the result into one big product.
	const elements = interpretElements(interpretedParts, settings, context)
	if (elements.length === 0) throw new InterpretationError('Could not interpret an empty Expression.', 'EmptyExpression')
	if (elements.length === 1) return elements[0]
	return new Product(elements)
}
