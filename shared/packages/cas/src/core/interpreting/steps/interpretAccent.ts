import { InterpretationError } from '@step-wise/utils'
import { type AccentName, type AccentInputValue, isAccent } from '@step-wise/math-input-value'

import { ExpressionNode, Variable } from '../../nodes'

// Interpret accents like dot(x) or hat(x).
export function interpretAccent(element: AccentInputValue): ExpressionNode {
	const { name, value, alias } = element
	if (!isAccent(name)) throw new InterpretationError(`Could not interpret the accent "${alias}${value})". The accent name "${name}" is not known.`, 'UnknownAccent', name)
	if (value.length === 0) throw new InterpretationError(`Could not interpret the accent "${alias}${value})". It had no characters in it.`, 'EmptyAccent', name)
	if (value.length > 1) throw new InterpretationError(`Could not interpret the accent "${alias}${value})". More than one character is not supported.`, 'TooLongAccent', value)
	return new Variable(value, undefined, name as AccentName)
}
