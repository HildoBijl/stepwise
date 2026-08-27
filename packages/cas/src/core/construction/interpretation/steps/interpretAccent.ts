import { InterpretationError } from '@step-wise/js-utils'
import { type AccentName, type AccentInputValue, isAccentName } from '@step-wise/math-input-value'

import { ExpressionNode, Variable } from '../../nodes'

// Interpret accents like dot(x) or hat(x).
export function interpretAccent(element: AccentInputValue): ExpressionNode {
	const { name, value, alias } = element
	const displayValue = `${alias || `${name}(`}${value})`
	if (!isAccentName(name)) throw new InterpretationError(`Could not interpret the accent "${displayValue}". The accent name "${name}" is not known.`, 'UnknownAccent', name)
	if (value.length === 0) throw new InterpretationError(`Could not interpret the accent "${displayValue}". It had no characters in it.`, 'EmptyAccent', name)
	if (value.length > 1) throw new InterpretationError(`Could not interpret the accent "${displayValue}". More than one character is not supported.`, 'TooLongAccent', value)
	return new Variable(value, undefined, name as AccentName)
}
