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
	Fraction: getFunctionFuncs,
	SquareRoot: getFunctionFuncs,
	Root: getFunctionFuncs,
	Logarithm: getFunctionFuncs,
	SubSup: getFunctionFuncs,
	Accent: getAccentFuncs,
	Equation: getEquationFuncs,
}

// getFuncs takes an FI object and returns an object with all the functions for that FI type.
export function getFIFuncs(FI) {
	const getFuncs = typeFunctions[typeof FI === 'string' ? 'ExpressionPart' : FI.type]
	if (!getFuncs)
		throw new Error(`Invalid FI type: cannot find functions for FI type "${FI?.type}".`)
	return getFuncs(FI)
}

// The following functions simplify an inconvenient function argument convention, allowing these functions to be called with FI instead of values.
export function getFIStartCursor(FI) {
	if (typeof FI === 'string') FI = { type: 'ExpressionPart', value: FI }
	return getFIFuncs(FI).getStartCursor(FI.type === 'Expression' || FI.type === 'Equation' || FI.type === 'ExpressionPart' || FI.type === 'SubscriptText' || FI.type === 'Accent' ? FI.value : FI)
}

export function getFIEndCursor(FI) {
	if (typeof FI === 'string') FI = { type: 'ExpressionPart', value: FI }
	return getFIFuncs(FI).getEndCursor(FI.type === 'Expression' || FI.type === 'Equation' || FI.type === 'ExpressionPart' || FI.type === 'SubscriptText' || FI.type === 'Accent' ? FI.value : FI)
}

export function isCursorAtFIStart(FI) {
	if (typeof FI === 'string') throw new Error('Cannot check a text cursor without a cursor position.')
	const value = FI.type === 'Expression' || FI.type === 'Equation' || FI.type === 'ExpressionPart' || FI.type === 'SubscriptText' || FI.type === 'Accent' ? FI.value : FI
	return getFIFuncs(FI).isCursorAtStart(value, FI.cursor)
}

export function isCursorAtFIEnd(FI) {
	if (typeof FI === 'string') throw new Error('Cannot check a text cursor without a cursor position.')
	const value = FI.type === 'Expression' || FI.type === 'Equation' || FI.type === 'ExpressionPart' || FI.type === 'SubscriptText' || FI.type === 'Accent' ? FI.value : FI
	return getFIFuncs(FI).isCursorAtEnd(value, FI.cursor)
}

export function isFIEmpty(FI) {
	if (typeof FI === 'string') FI = { type: 'ExpressionPart', value: FI }
	const value = FI.type === 'Expression' || FI.type === 'Equation' || FI.type === 'ExpressionPart' || FI.type === 'SubscriptText' || FI.type === 'Accent' ? FI.value : FI
	return getFIFuncs(FI).isEmpty(value)
}

export function canMoveFICursorVertically(FI, up) {
	const canMoveCursorVertically = getFIFuncs(FI).canMoveCursorVertically
	return !!canMoveCursorVertically && canMoveCursorVertically(FI, up)
}

export function FIAcceptsKey(keyInfo, FI, settings) {
	if (typeof FI === 'string') FI = { type: 'ExpressionPart', value: FI, cursor: 0 }
	return getFIFuncs(FI).acceptsKey(keyInfo, FI, settings)
}
