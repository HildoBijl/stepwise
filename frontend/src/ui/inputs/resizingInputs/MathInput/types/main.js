import { getFuncs as getExpressionFuncs } from './Expression'
import { getFuncs as getExpressionPartFuncs } from './ExpressionPart'
import { getFuncs as getFunctionFuncs } from './Function'
import { getFuncs as getSubscriptTextFuncs } from './Function/SubscriptText'
import { getFuncs as getAccentFuncs } from './Accent'
import { getFuncs as getEquationFuncs } from './Equation'

const typeFunctions = {
	Expression: getExpressionFuncs,
	ExpressionPart: getExpressionPartFuncs,
	SubscriptText: getSubscriptTextFuncs,
	Function: getFunctionFuncs,
	Accent: getAccentFuncs,
	Equation: getEquationFuncs,
}

// getFuncs takes an FI object and returns an object with all the functions for that FI type.
export function getFIFuncs(FI) {
	const getFuncs = typeFunctions[FI.type]
	if (!getFuncs)
		throw new Error(`Invalid FI type: cannot find functions for FI type "${FI.type}".`)
	return getFuncs(FI)
}

// The following functions simplify an inconvenient function argument convention, allowing these functions to be called with FI instead of values.
export function getFIStartCursor(FI) {
	const { value } = FI
	return getFIFuncs(FI).getStartCursor(value)
}

export function getFIEndCursor(FI) {
	const { value } = FI
	return getFIFuncs(FI).getEndCursor(value)
}

export function isCursorAtFIStart(FI) {
	const { value, cursor } = FI
	return getFIFuncs(FI).isCursorAtStart(value, cursor)
}

export function isCursorAtFIEnd(FI) {
	const { value, cursor } = FI
	return getFIFuncs(FI).isCursorAtEnd(value, cursor)
}

export function isFIEmpty(FI) {
	const { value } = FI
	return getFIFuncs(FI).isEmpty(value)
}

export function canMoveFICursorVertically(FI, up) {
	const canMoveCursorVertically = getFIFuncs(FI).canMoveCursorVertically
	return !!canMoveCursorVertically && canMoveCursorVertically(FI, up)
}

export function FIAcceptsKey(keyInfo, FI, settings) {
	return getFIFuncs(FI).acceptsKey(keyInfo, FI, settings)
}
