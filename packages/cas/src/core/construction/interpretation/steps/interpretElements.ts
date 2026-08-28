import { InterpretationError } from '@step-wise/js-utils'
import { isTextPart } from '@step-wise/math-input-value'

import { ExpressionNode } from '../../nodes/index.ts'

import type { InterpretationPart, InterpreterContext } from '../types.ts'

import { interpretAccent } from './interpretAccent.ts'
import { interpretFraction, interpretRoot, interpretSquareRoot } from './interpretConstruct.ts'
import { interpretSubSup } from './interpretSubSup.ts'

// Interpret the remaining accents, SubSups and self-contained constructs.
export function interpretElements(value: InterpretationPart[], context: InterpreterContext): ExpressionNode[] {
	const result: ExpressionNode[] = []
	value.forEach(element => {
		if (element instanceof ExpressionNode) return result.push(element)
		if (isTextPart(element)) throw new Error('Text must be interpreted before interpreting remaining input-value elements.')

		switch (element.type) {
			case 'Accent': return result.push(interpretAccent(element))
			case 'SubSup': return interpretSubSup(element, result, context)
			case 'Fraction': return result.push(interpretFraction(element, context))
			case 'SquareRoot': return result.push(interpretSquareRoot(element, context))
			case 'Root': return result.push(interpretRoot(element, context))
			case 'Logarithm': throw new InterpretationError('Could not interpret a logarithm without its external argument.', 'UnknownFunction', element.type)
		}
	})
	return result
}
