import { InterpretationError, last } from '@step-wise/js-utils'
import { type SubSupInputValue } from '@step-wise/math-input-value'

import { ExpressionNode, Power, Variable } from '../../nodes'

import type { InterpreterContext } from '../types'

// Incorporate subscript/superscript into the ALREADY EXISTING previous term.
export function interpretSubSup(element: SubSupInputValue, result: ExpressionNode[], context: InterpreterContext) {
	const { subscript, superscript } = element
	if (subscript === undefined && superscript === undefined) throw new InterpretationError('Could not interpret an empty subscript/superscript construct.', 'EmptySubSup')
	if (subscript === '') throw new InterpretationError('Could not interpret an empty subscript.', 'EmptySubscript')
	const previousTerm = last(result)

	// Fix the subscript.
	if (subscript !== undefined) {
		if (!(previousTerm instanceof Variable)) throw new InterpretationError(`Could not interpret the subscript "${subscript}".`, 'MisplacedSubscript', JSON.stringify(subscript))
		result[result.length - 1] = new Variable(previousTerm.symbol, subscript, previousTerm.accent)
	}

	// Fix the superscript.
	if (superscript) {
		const base = last(result)
		if (!base) throw new InterpretationError('Could not interpret the superscript due to a missing term prior to it.', 'MisplacedSuperscript', '')
		result[result.length - 1] = new Power(base, context.interpretBrackets(superscript, context))
	}
}
