import { InterpretationError, last } from '@step-wise/utils'
import { type InterpretationSettings, type SubSupInputValue } from '@step-wise/math-input-value'

import { ExpressionNode, Power, Variable } from '../../nodes'

import type { InterpreterContext } from '../types'

// Incorporate subscript/superscript into the ALREADY EXISTING previous term.
export function incorporateSubSup(element: SubSupInputValue, result: ExpressionNode[], settings: InterpretationSettings, context: InterpreterContext) {
	const [sub, sup] = element.value
	const previousTerm = last(result)

	// Fix the subscript.
	if (sub) {
		if (!(previousTerm instanceof Variable)) throw new InterpretationError(`Could not interpret the subscript "${sub.value}".`, 'MisplacedSubscript', JSON.stringify(sub.value))
		result[result.length - 1] = new Variable(previousTerm.symbol, sub.value, previousTerm.accent)
	}

	// Fix the superscript.
	if (sup) {
		const base = last(result)
		if (!base) throw new InterpretationError('Could not interpret the superscript due to a missing term prior to it.', 'MisplacedSuperscript', '')
		result[result.length - 1] = new Power(base, context.interpretBrackets(sup.value, settings, context))
	}
}
