
import * as Expression from './Expression'
import * as ExpressionPart from './ExpressionPart'
import * as Fraction from './Fraction'

const functions = {
	Expression,
	ExpressionPart,
	Fraction,
}

// toLatex takes a value object and turns it into Latex code.
export function toLatex(data) {
	const { type, value } = data
	return functions[type].toLatex(value)
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, contentsElement, originalData, originalContentsElement) {
	// Check which type of object we have and pass on the call.
	const { type } = data
	return functions[type].keyPressToData(keyInfo, data, contentsElement, originalData, originalContentsElement) // ToDo later: process contents element.
}

export function getStartCursor(data) {
	const { type, value } = data
	return functions[type].getStartCursor(value)
}

export function getEndCursor(data) {
	const { type, value } = data
	return functions[type].getEndCursor(value)
}

export function isCursorAtStart(data) {
	const { type, value, cursor } = data
	return functions[type].isCursorAtStart(value, cursor)
}

export function isCursorAtEnd(data) {
	const { type, value, cursor } = data
	return functions[type].isCursorAtEnd(value, cursor)
}

export function countNetBrackets(data, relativeToCursor) {
	const { type } = data
	if (!functions[type].countNetBrackets)
		return 0
	return functions[type].countNetBrackets(data, relativeToCursor)
}