import { addCursor } from '../Input'

import * as Expression from './Expression'
import * as ExpressionPart from './ExpressionPart'
import * as Fraction from './Fraction'
import * as SimpleText from './SimpleText'
import * as SubSup from './SubSup'

const functions = {
	Expression,
	ExpressionPart,
	Fraction,
	SimpleText,
	SubSup,
}

// toLatex takes a value object and turns it into Latex code.
export function toLatex(data, options) {
	return functions[data.type].toLatex(data.value, options)
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

export function getEmpty(type) {
	return functions[type].getEmpty()
}

export function isEmpty(data) {
	const { type, value } = data
	return functions[type].isEmpty(value)
}

export function shouldRemove(data) {
	const { type, value } = data
	return functions[type].shouldRemove(value)
}

export function canMerge(data, mergeWithNext, fromOutside) {
	return functions[data.type].canMerge(data.value, mergeWithNext, fromOutside)
}

// merge takes an expression value and an index pointing to a special element. It then merges what comes after this element (when mergeWithNext is true (default)) into the element, or what comes before the element (when mergeWithNext is false) into the numerator (left). An expression data object is returned, including properly placed cursor.
export function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	return functions[expressionValue[partIndex].type].merge(expressionValue, partIndex, mergeWithNext, fromOutside)
}

export function canSplit(data) {
	return functions[data.type].canSplit(data)
}

// split takes an element that needs to be split (like a fraction with a cursor halfway through the denominator) and returns an object (including cursor) representing the split result (like an expression with two elements, one being a fraction without most of the denominator and the second being what used to be in the denominator). Often the result is a non-cleaned expression, but it can be anything.
export function split(data) {
	return functions[data.type].split(data)
}

// cleanUp takes a object and cleans it up, removing unnecessary elements and such. While doing so, the respective cursor is kept in the same place. If no cursor is provided, no cursor is returned either. Generally, the clean-up function is called by the input field after every data change.
export function cleanUp(data) {
	return functions[data.type].cleanUp(data)
}

// zoomIn takes a data object with a cursor and goes down one layer (or multiple if a number is specified), hence going to the first element which the cursor points at. The cursor is brought along.
export function zoomIn(data, number = 1) {
	// If the number is large than 1, call this function recursively.
	if (number > 1)
		return zoomIn(zoomIn(data), number - 1)

	// Zoom in in the regular way.
	const { value, cursor } = data
	return addCursor(value[cursor.part], cursor.cursor)
}

// zoomInAt takes a data object and zooms in at a particular child of said data element. If that element is pointed at by the cursor, the cursor is passed along. Otherwise no cursor is passed.
export function zoomInAt(data, part) {
	const { value, cursor } = data
	return (cursor && cursor.part === part) ? zoomIn(data) : value[part]
}