// This is the most general template for settings up equation function objects, like sqrt, log, etcetera. It has default functionalities for most basic cases.

import { firstOf } from 'step-wise/util/arrays'

import { removeCursor } from '../../../Input'
import { getClosestElement } from '../../../MathWithCursor'

import { getFuncs, zoomIn, zoomInAt, getDataStartCursor, getDataEndCursor, isCursorAtDataStart, isCursorAtDataEnd, isDataEmpty, dataAcceptsKey } from '../../'
import Expression from '../../Expression'
import { getKeyPressHandlers, getSubExpression } from '../../support/ExpressionSupport'
import { isCursorKey } from '../../support/acceptsKey'

const allFunctions = {
	create,
	getInitial,
	getInitialCursor,
	toLatex,
	charPartToValuePart,
	valuePartToCharPart,
	getCursorProperties,
	acceptsKey,
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
	functionElement.value = funcs.getInitial(alias)

	// Define cursors.
	const start = getDataStartCursor(expressionData)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const end = getDataEndCursor(expressionData)

	// Build the new Expression around it.
	let { value } = expressionData
	const expressionBefore = getSubExpression(value, start, beforeAlias)
	const expressionAfter = getSubExpression(value, afterAlias, end)
	value = [
		...expressionBefore,
		functionElement,
		...expressionAfter,
	]
	return {
		...expressionData,
		value,
		cursor: {
			part: value.indexOf(functionElement) + 1,
			cursor: getDataStartCursor(firstOf(expressionAfter)),
		},
	}
}

export function getInitial(alias) {
	return getEmpty()
}

export function getInitialCursor(element) {
	return getFuncs(element).getStartCursor(element.value)
}

export function toLatex(data) {
	throw new Error(`Missing function error: the function component "${data && data.name}" has not implemented the toLatex function.`)
}

export function charPartToValuePart(part) {
	return part
}

export function valuePartToCharPart(part) {
	return part
}

export function getCursorProperties(data, charElements, container) {
	const { cursor } = data
	const activeElementData = zoomIn(data)
	const valuePartToCharPart = getFuncs(data).valuePartToCharPart
	const charPart = valuePartToCharPart ? valuePartToCharPart(cursor.part) : cursor.part
	return getFuncs(activeElementData).getCursorProperties(activeElementData, charElements[charPart], container)
}

export function acceptsKey(keyInfo, data) {
	if (isCursorKey(keyInfo, data))
		return true
	return dataAcceptsKey(keyInfo, zoomIn(data))
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = data
	const activeElementData = zoomIn(data)

	// Verify the key.
	if (!acceptsKey(keyInfo, data))
		return data

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
	const charPart = firstOf(trace)
	const part = getFuncs(data).charPartToValuePart(charPart)
	const element = data.value[part]

	// If no element can be traced, then most likely the user clicked on the function name. Return null to indicate we cannot use the element to trace the cursor position.
	if (!element)
		return null

	// All good. Pass on to the respective element.
	const newCursor = getFuncs(element).charElementClickToCursor(evt, element, trace.slice(1), charElements[charPart], equationElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const charPart = getClosestElement(coordinates, boundsData)
	const part = getFuncs(data).charPartToValuePart(charPart)
	const element = data.value[part]
	const newCursor = getFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[charPart], element, charElements[charPart], contentsElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function getFirstParameterIndex(value, backwards) {
	if (backwards)
		return value.length - 1 - getFirstParameterIndex([...value].reverse(), false)
	return value.findIndex(element => !!element)
}

export function getStartCursor(value) {
	const part = getFirstParameterIndex(value)
	return { part, cursor: getDataStartCursor(value[part]) }
}

export function getEndCursor(value) {
	const part = getFirstParameterIndex(value, true)
	return { part, cursor: getDataEndCursor(value[part]) }
}

export function isCursorAtStart(value, cursor) {
	const part = getFirstParameterIndex(value)
	const data = { type: 'Function', value, cursor }
	return cursor.part === part && isCursorAtDataStart(zoomIn(data))
}

export function isCursorAtEnd(value, cursor) {
	const part = getFirstParameterIndex(value, true)
	const data = { type: 'Function', value, cursor }
	return cursor.part === part && isCursorAtDataEnd(zoomIn(data))
}

export function getEmpty(numParameters = 1) {
	return (new Array(numParameters)).fill(0).map(() => ({ type: 'Expression', value: Expression.getEmpty() }))
}

export function isEmpty(value) {
	return value.every(element => isDataEmpty(element))
}

export function cleanUp(data) {
	const { value, cursor } = data

	// Clean up the parts individually, keeping track of the cursor.
	let newCursor = null
	const newValue = value.map((_, part) => {
		// Extract the element.
		const element = zoomInAt(data, part)
		if (element === null)
			return element

		// Clean up the element if we can.
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

	// Check if the expression part after this function started with a closing bracket. So effectively, the function was empty. In that case, remove the closing bracket too.
	let expressionPartAfter = expressionValue[partIndex + 1]
	if (expressionPartAfter.value[0] === ')') {
		expressionPartAfter = {
			...expressionPartAfter,
			value: expressionPartAfter.value.slice(1),
		}
	}

	// Merge it all into a new expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex),
			removeCursor(removedElement),
			expressionPartAfter,
			...expressionValue.slice(partIndex + 2),
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