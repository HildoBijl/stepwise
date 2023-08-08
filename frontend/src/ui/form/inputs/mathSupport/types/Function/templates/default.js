// This is the most general template for settings up equation function objects, like sqrt, log, etcetera. It has default functionalities for most basic cases.

import { firstOf } from 'step-wise/util'
import { support } from 'step-wise/CAS'

import { removeCursor } from '../../../../support/FieldInput'

import { getClosestElement } from '../../../MathWithCursor'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isCursorAtFIStart, isCursorAtFIEnd, isFIEmpty, FIAcceptsKey, zoomIn, zoomInAt } from '../..'
import expressionFunctions from '../../Expression'
import { getKeyPressHandlers } from '../../support/ExpressionSupport'
import { isCursorKey } from '../../support/acceptsKey'

const { getSubExpression } = support

const allFunctions = {
	create,
	getInitial,
	getInitialCursor,
	toLatex,
	charPartToValuePart,
	valuePartToCharPart,
	getCursorProperties,
	acceptsKey,
	keyPressToFI,
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

export function create(expressionFI, part, position, name, alias) {
	// Set up the new function element.
	const functionElement = { type: 'Function', name, alias }
	const funcs = getFIFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias)

	// Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const end = getFIEndCursor(expressionFI)

	// Build the new Expression around it.
	let { value } = expressionFI
	const expressionBefore = getSubExpression(value, start, beforeAlias)
	const expressionAfter = getSubExpression(value, afterAlias, end)
	value = [
		...expressionBefore,
		functionElement,
		...expressionAfter,
	]
	return {
		...expressionFI,
		value,
		cursor: {
			part: value.indexOf(functionElement) + 1,
			cursor: getFIStartCursor(firstOf(expressionAfter)),
		},
	}
}

export function getInitial(alias) {
	return getEmpty()
}

export function getInitialCursor(element) {
	return getFIFuncs(element).getStartCursor(element.value)
}

export function toLatex(FI) {
	throw new Error(`Missing function error: the function component "${FI && FI.name}" has not implemented the toLatex function.`)
}

export function charPartToValuePart(part) {
	return part
}

export function valuePartToCharPart(part) {
	return part
}

export function getCursorProperties(FI, charElements, container) {
	const { cursor } = FI
	const activeElementFI = zoomIn(FI)
	const valuePartToCharPart = getFIFuncs(FI).valuePartToCharPart
	const charPart = valuePartToCharPart ? valuePartToCharPart(cursor.part) : cursor.part
	return getFIFuncs(activeElementFI).getCursorProperties(activeElementFI, charElements[charPart], container)
}

export function acceptsKey(keyInfo, FI, settings) {
	if (isCursorKey(keyInfo, FI))
		return true
	return FIAcceptsKey(keyInfo, zoomIn(FI), settings)
}

export function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = FI
	const activeElementFI = zoomIn(FI)

	// Verify the key.
	if (!acceptsKey(keyInfo, FI, settings))
		return FI

	const { passOn, moveLeft, moveRight } = getKeyPressHandlers(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)

	// For left/right-arrows, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part > 0 && isCursorAtFIStart(activeElementFI))
		return moveLeft()
	if (key === 'ArrowRight' && cursor.part < value.length - 1 && isCursorAtFIEnd(activeElementFI))
		return moveRight()

	// When the cursor is at the start of an element and a backspace is pressed, or at the end of an element and a delete is pressed, move the cursor too.
	if (key === 'Backspace' && isCursorAtFIStart(activeElementFI) && !isCursorAtStart(value, cursor))
		return moveLeft()
	if (key === 'Delete' && isCursorAtFIEnd(activeElementFI) && !isCursorAtEnd(value, cursor))
		return moveRight()

	// Pass on to the appropriate child element.
	return passOn()
}

export function canMoveCursorVertically(FI, up) {
	const activeElementFI = zoomIn(FI)
	const canMoveCursorVertically = getFIFuncs(activeElementFI).canMoveCursorVertically
	return canMoveCursorVertically ? canMoveCursorVertically(activeElementFI, up) : false
}

export function charElementClickToCursor(evt, FI, trace, charElements, equationElement) {
	const charPart = firstOf(trace)
	const part = getFIFuncs(FI).charPartToValuePart(charPart)
	const element = FI.value[part]

	// If no element can be traced, then most likely the user clicked on the function name. Return null to indicate we cannot use the element to trace the cursor position.
	if (!element)
		return null

	// All good. Pass on to the respective element.
	const newCursor = getFIFuncs(element).charElementClickToCursor(evt, element, trace.slice(1), charElements[charPart], equationElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement) {
	const charPart = getClosestElement(coordinates, boundsData)
	const part = getFIFuncs(FI).charPartToValuePart(charPart)
	const element = FI.value[part]
	const newCursor = getFIFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[charPart], element, charElements[charPart], contentsElement)
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
	return { part, cursor: getFIStartCursor(value[part]) }
}

export function getEndCursor(value) {
	const part = getFirstParameterIndex(value, true)
	return { part, cursor: getFIEndCursor(value[part]) }
}

export function isCursorAtStart(value, cursor) {
	const part = getFirstParameterIndex(value)
	const FI = { type: 'Function', value, cursor }
	return cursor.part === part && isCursorAtFIStart(zoomIn(FI))
}

export function isCursorAtEnd(value, cursor) {
	const part = getFirstParameterIndex(value, true)
	const FI = { type: 'Function', value, cursor }
	return cursor.part === part && isCursorAtFIEnd(zoomIn(FI))
}

export function getEmpty(numParameters = 1) {
	return (new Array(numParameters)).fill(0).map(() => ({ type: 'Expression', value: expressionFunctions.getEmpty() }))
}

export function isEmpty(value) {
	return value.every(element => isFIEmpty(element))
}

export function cleanUp(FI, settings) {
	const { value, cursor } = FI

	// Clean up the parts individually, keeping track of the cursor.
	let newCursor = null
	const newValue = value.map((_, part) => {
		// Extract the element.
		const element = zoomInAt(FI, part)
		if (element === null)
			return element

		// Clean up the element if we can.
		const cleanUp = getFIFuncs(element).cleanUp
		const cleanedElement = cleanUp ? cleanUp(element, settings) : element

		// Extract the possibly adjusted cursor positions.
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: cleanedElement.cursor }
		return removeCursor(cleanedElement)
	})

	// Assemble everything.
	return {
		...FI,
		value: newValue,
		cursor: newCursor,
	}
}

export function removeElementFromExpression(expressionValue, partIndex, withBackspace) {
	// Find what we replace the element by.
	const element = expressionValue[partIndex]
	const removedElement = getFIFuncs(element).removeElement(element, withBackspace)

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

export function removeElement(FI, withBackspace) {
	const { alias } = FI
	return {
		type: 'ExpressionPart',
		value: withBackspace ? alias.slice(0, -1) : alias.slice(1),
		cursor: withBackspace ? alias.length - 1 : 0,
	}
}