/*
 * This is where all the magic happens for math input fields. Inside these input fields, there are several element types.
 * - Expression: this is the default for any maths stuff. It's a list of the below elements.
 * - ExpressionPart: anything that's a string. So "a+b" can be an expression part, or "2*sin(3)+5". (It transforms stars into cdots.)
 * - SimpleText: text that has no functionality. Generally, this is used inside a subscript. (It does not transform stars into cdots.)
 * - Function: there is a large variety of functions that can be used. Some examples include:
 *   x Fraction: has two arguments and puts a divide stripe between them.
 *   x SubSup: a subscript and superscript. Can have one of them or both.
 *   x sqrt: the square root.
 *   x root: the root with a power added to it.
 *   x log: a logarithm with certain base.
 * 
 * Every one of the above element types can have a variety of functions. We will list the important ones.
 * - toLatex(data): takes a data object and returns an object { latex: ..., chars: ... } where latex has the latex code and chars show the chars that will be in said latex code, in the order in which Katex renders them. (Yes, this requires back-engineering Katex, but otherwise we cannot trace elements in the equation.)
 * - getCursorProperties(data, charElements, container): takes a data object, an array of char elements and the container of the input field and uses this to determine the properties { x, y, height } that the cursor should have.
 * - keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement): takes a keyInfo event, a data object and some reference elements. It uses this to determine a new data object: how the data (value and cursor) change depending on the given key press.
 * - canMoveCursorVertically(data, up): takes a data object and a boolean parameter "up". It checks whether a cursor can move vertically (up or down depending on the second parameter) inside this element or one of its children.
 * - charElementClickToCursor(evt, data, trace, charElements, contentsElement): takes a click on a charElement and returns the responding cursor position. It's given all required data. It may return null in case it cannot find anything, in which coordinates are used instead.
 * - coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) takes a set of coordinates and turns it into a cursor position close to that click.
 * - getStartCursor(value): takes a value object and returns the cursor for the start of said data.
 * - getEndCursor(value): same as getStartCursor, but then for the end.
 * - isCursorAtStart(value, cursor): checks if the cursor can be considered to be at the start of the given value.
 * - isCursorAtEnd(value, cursor): same as isCursorAtStart, but then for the end.
 * - getEmpty(): returns an empty value for the element type.
 * - isEmpty(value): checks if the given value for the element type can be seen as empty.
 * - shouldRemove(data): checks if the element is empty enough that it needs to be automatically removed on a clean-up.
 * - countNetBrackets(data, relativeToCursor = 0): counts the net number of brackets (opening brackets minus closing brackets) inside this element. If relativeToCursor is set to 1 (right) or -1 (left) this is only done for a part of the expression: the part as seen from the cursor in the indicated direction.
 * - canMerge(data, mergeWithNext, fromOutside): checks if the element is capable of merging with an expression part coming after it (when mergeWithNext = true) or before it (when mergeWithNext = false). This may depend on whether this merging is triggered from outside (the cursor is after the element and a backspace is pressed or the cursor is before the element and a delete is pressed) or from inside (vice versa). 
 * - merge(expressionValue, partIndex, mergeWithNext, fromOutside): takes an expression value and an index pointing to a special element. It then merges what comes after this element (when mergeWithNext is true) or what comes before the element (when mergeWithNext is false) into the element. The function must handle all the complexities of merging, returning an expression data object including properly placed cursor.
 * - canSplit(data): checks if the element can split off a part of it (like on a spacebar press) given its value and cursor position.
 * - split(data): takes an element that needs to be split (like a fraction with a cursor halfway through the denominator) and returns an object (including cursor) representing the split result (like an expression with two elements, one being a fraction without most of the denominator and the second being what used to be in the denominator). Often the result is a non-cleaned expression, but it can be any element type.
 * - cleanUp(data): takes an element and cleans it up, removing unnecessary elements and such. While doing so, the respective cursor is kept in the same place. If no cursor is provided, no cursor is returned either. Generally, the clean-up function is called by the input field after every data change.
 * 
 * In addition to the above functions, certain element types may have extra functionalities, but naturally this varies per element type.
 */

import { addCursor } from '../Input'

import Expression from './Expression'
import ExpressionPart from './ExpressionPart'
import SimpleText from './SimpleText'
import * as Fraction from './Fraction' // TODO
import * as SubSup from './SubSup' // TODO
import * as Function from './Function'

const functions = {
	Expression,
	ExpressionPart,
	Fraction,
	SimpleText,
	SubSup,
	Function,
}

// getFuncs takes a data object and returns an object with all the functions for that data type.
export function getFuncs(data) {
	// Check if functions exist for this data type.
	const funcs = functions[data.type]
	if (!funcs)
		throw new Error(`Invalid data type: cannot find functions for data type "${data.type}".`)

	// Check if the functions require us to iterate deeper.
	if (funcs.getFuncs)
		return funcs.getFuncs(data)

	// All normal.
	return funcs
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

// The following functions simplify an inconvenient function argument convention, allowing these functions to be called with data instead of values.
export function getDataStartCursor(data) {
	const { value } = data
	return getFuncs(data).getStartCursor(value)
}

export function getDataEndCursor(data) {
	const { value } = data
	return getFuncs(data).getEndCursor(value)
}

export function isCursorAtDataStart(data) {
	const { value, cursor } = data
	return getFuncs(data).isCursorAtStart(value, cursor)
}

export function isCursorAtDataEnd(data) {
	const { value, cursor } = data
	return getFuncs(data).isCursorAtEnd(value, cursor)
}

export function isDataEmpty(data) {
	const { value } = data
	return getFuncs(data).isEmpty(value)
}
