import { type FunctionInputValue, type InterpretationSettings, type SubSupInputValue } from '@step-wise/math-input-value'

import { ExpressionNode } from '../../nodes'

import type { IntermediateInterpretationPart, InterpreterContext } from '../types'

import { interpretAccent } from './interpretAccent'
import { incorporateSubSup } from './interpretSubSup'
import { interpretSpecialFunctionWithoutParameterAfter } from './interpretSpecialFunction'

// Interpret remaining non-string elements: accents, SubSups and special functions.
export function interpretElements(value: IntermediateInterpretationPart[], settings: InterpretationSettings, context: InterpreterContext): ExpressionNode[] {
	const result: ExpressionNode[] = []
	value.forEach(element => {
		if (element instanceof ExpressionNode) return result.push(element)
		if (element.type === 'Accent') result.push(interpretAccent(element))
		if (element.type === 'Function') {
			if (element.name === 'subSup') incorporateSubSup(element as SubSupInputValue, result, settings, context)
			else result.push(interpretSpecialFunctionWithoutParameterAfter(element as FunctionInputValue, settings, context))
		}
	})
	return result
}
