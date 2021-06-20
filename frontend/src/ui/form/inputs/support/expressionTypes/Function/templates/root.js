// This is the most general template for settings up equation function objects, like sqrt, log, etcetera. It has default functionalities for most basic cases.

import { firstOf, lastOf } from 'step-wise/util/arrays'

import { removeCursor } from '../../../Input'
import { getClosestElement } from '../../../MathWithCursor'

import { getFuncs, zoomIn, zoomInAt, getDataStartCursor, getDataEndCursor, isCursorAtDataStart, isCursorAtDataEnd, isDataEmpty } from '../../'
import { getEmpty as getEmptyExpression } from '../../Expression'
import { getKeyPressHandlers } from '../../support/ExpressionSupport'

const allFunctions = {
	create,
	getInitial,
	getInitialCursor,
	toLatex,
	getCursorProperties,
	keyPressToData,
	canMoveCursorVertically,
	charElementClickToCursor,
	coordinatesToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	getEmpty,
	isEmpty,
	cleanUp,
	removeElementFromExpression,
	removeElement,
}
export default allFunctions

export function create(expressionData, part, position, name, alias) {
	// Set up the new function element.
	const functionElement = { type: 'Function', name, alias }
	const funcs = getFuncs(functionElement)
	functionElement.value = funcs.getInitial()

	// Build the new Expression around it.
	const { value, cursor } = expressionData
	const expressionPartValue = value[part].value
	const newValue = [
		...value.slice(0, part),
		{ type: 'ExpressionPart', value: expressionPartValue.substring(0, position) },
		functionElement,
		{ type: 'ExpressionPart', value: expressionPartValue.substring(position + alias.length) },
		...value.slice(part + 1),
	]
	const newCursor = { part: cursor.part + 2, cursor: funcs.getInitialCursor(functionElement) }
	return {
		...expressionData,
		value: newValue,
		cursor: newCursor,
	}
}

export function getInitial() {
	return getEmpty()
}

export function getInitialCursor(element) {
	return getFuncs(element).getStartCursor(element.value)
}

export function toLatex(data) {
	throw new Error(`Missing function error: the function component "${data && data.name}" has not implemented the toLatex function.`)
}

export function getCursorProperties(data, charElements, container) {
	const { cursor } = data
	const activeElementData = zoomIn(data)
	return getFuncs(activeElementData).getCursorProperties(activeElementData, charElements[cursor.part], container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = data
	const activeElementData = zoomIn(data)
	
	const { passOn, moveLeft, moveRight } = getKeyPressHandlers(keyInfo, data, charElements, topParentData, contentsElement, cursorElement)

	// For left/right-arrows, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part > 0 && isCursorAtDataStart(activeElementData))
		return moveLeft()
	if (key === 'ArrowRight' && cursor.part < value.length - 1 && isCursorAtDataEnd(activeElementData))
		return moveRight()

	// When the cursor is at the start of an element and a backspace is pressed, or at the end of an element and a delete is pressed, move the cursor too.
	if (key === 'Backspace' && isCursorAtDataStart(activeElementData) && !isCursorAtStart(value, cursor))
		return moveLeft()
	if (key === 'Delete' && isCursorAtDataEnd(activeElementData) && !isCursorAtEnd(value, cursor))
		return moveRight()

	// Pass on to the appropriate child element.
	return passOn()
}

export function canMoveCursorVertically(data, up) {
	const activeElementData = zoomIn(data)
	const canMoveCursorVertically = getFuncs(activeElementData).canMoveCursorVertically
	return canMoveCursorVertically ? canMoveCursorVertically(activeElementData, up) : false
}

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	const part = firstOf(trace)
	const element = data.value[part]

	// If no element can be traced, then most likely the user clicked on the function name. Return null to indicate we cannot use the element to trace the cursor position.
	if (!element)
		return null

	// All good. Pass on to the respective element.
	const newCursor = getFuncs(element).charElementClickToCursor(evt, element, trace.slice(1), charElements[part], equationElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const part = getClosestElement(coordinates, boundsData)
	const element = data.value[part]
	const newCursor = getFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[part], element, charElements[part], contentsElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function getStartCursor(value) {
	return { part: 0, cursor: getDataStartCursor(firstOf(value)) }
}

export function getEndCursor(value) {
	return { part: value.length - 1, cursor: getDataEndCursor(lastOf(value)) }
}

export function isCursorAtStart(value, cursor) {
	const data = { type: 'Function', value, cursor }
	return cursor.part === 0 && isCursorAtDataStart(zoomIn(data))
}

export function isCursorAtEnd(value, cursor) {
	const data = { type: 'Function', value, cursor }
	return cursor.part === value.length - 1 && isCursorAtDataEnd(zoomIn(data))
}

export function getEmpty(numParameters = 1) {
	return (new Array(numParameters)).fill(0).map(() => ({ type: 'Expression', value: getEmptyExpression() }))
}

export function isEmpty(value) {
	return value.every(element => isDataEmpty(element))
}

export function cleanUp(data) {
	const { value, cursor } = data

	// Clean up the parts individually, keeping track of the cursor.
	let newCursor = null
	const newValue = value.map((_, part) => {
		// Clean up the element if we can.
		const element = zoomInAt(data, part)
		const cleanUp = getFuncs(element).cleanUp
		const cleanedElement = cleanUp ? cleanUp(element) : element

		// Extract the possibly adjusted cursor positions.
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: cleanedElement.cursor }
		return removeCursor(cleanedElement)
	})

	// Assemble everything.
	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}

export function removeElementFromExpression(expressionValue, partIndex, withBackspace) {
	// Find what we replace the element by.
	const element = expressionValue[partIndex]
	const removedElement = getFuncs(element).removeElement(element, withBackspace)

	// Merge it all into a new expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex),
			removeCursor(removedElement),
			...expressionValue.slice(partIndex + 1),
		],
		cursor: {
			part: partIndex,
			cursor: removedElement.cursor,
		},
	}
}

export function removeElement(data, withBackspace) {
	const { alias } = data
	return {
		type: 'ExpressionPart',
		value: withBackspace ? alias.slice(0, -1) : alias.slice(1),
		cursor: withBackspace ? alias.length - 1 : 0,
	}
}