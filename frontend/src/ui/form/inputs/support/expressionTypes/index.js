
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
	return functions[data.type].toLatex(data.value)
}

// getLatexChars must return a list of all the characters that appear in the Katex rendering of the equation, in the order in which they appear in said rendering. (Yes, this sadly requires back-engineering Katex.)
export function getLatexChars(data) {
	return functions[data.type].getLatexChars(data.value)
}

// getCursorProperties takes a data object and an array of char elements and uses this to determine the properties { x, y, height } that the cursor should have.
export function getCursorProperties(data, charElements, container) {
	return functions[data.type].getCursorProperties(data, charElements, container)
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	return functions[data.type].keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement)
}

// canMoveCursorVertically checks whether a cursor can move vertically (up or down depending on the second parameter) inside this element or one of its children.
export function canMoveCursorVertically(data, up) {
	return functions[data.type].canMoveCursorVertically(data, up)
}

// charElementClickToCursor takes a click on a charElement and returns the responding cursor position. It's given all required data.
export function charElementClickToCursor(evt, data, trace, charElements, contentsElement) {
	return functions[data.type].charElementClickToCursor(evt, data.value, trace, charElements, contentsElement)
}

// coordinatesToCursor takes a set of coordinates and turns it into a cursor position close to that click.
export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	return functions[data.type].coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement)
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