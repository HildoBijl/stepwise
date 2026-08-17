// This is the most general template for settings up equation function objects, like sqrt, log, etcetera. It has default functionalities for most basic cases.

import { first } from '@step-wise/js-utils'
import { getSubExpression } from '@step-wise/math-input-value'

import { getClosestElement } from '../../../support'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isCursorAtFIStart, isCursorAtFIEnd, isFIEmpty, FIAcceptsKey, zoomIn, zoomInAt, fromFI, getConstructPart, getConstructPartNames, getFirstConstructPart } from '../..'
import { getKeyPressHandlers, isCursorKey } from '../../support'

export const allFunctions = {
	create,
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
	isEmpty,
	cleanUp,
	removeElementFromExpression,
	removeElement,
}

export function create(expressionFI, part, position, name, alias) {
	// Set up the new function element.
	const functionElement = { type: name, alias }
	const funcs = getFIFuncs(functionElement)
	Object.assign(functionElement, funcs.getInitial(alias))

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
			cursor: getFIStartCursor(first(expressionAfter)),
		},
	}
}

export function getInitialCursor(element) {
	return getFIFuncs(element).getStartCursor(element)
}

export function toLatex(FI) {
	throw new Error(`Missing construct error: the construct component "${FI?.type}" has not implemented the toLatex function.`)
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
	const { cursor } = FI
	const parts = getConstructPartNames(FI)
	const activeElementFI = zoomIn(FI)

	// Verify the key.
	if (!acceptsKey(keyInfo, FI, settings))
		return FI

	const { identity, moveLeft, moveRight } = getKeyPressHandlers(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)

	// For left/right-arrows, adjust the cursor.
	if (key === 'ArrowLeft' && parts.indexOf(cursor.part) > 0 && isCursorAtFIStart(activeElementFI))
		return moveLeft()
	if (key === 'ArrowRight' && parts.indexOf(cursor.part) < parts.length - 1 && isCursorAtFIEnd(activeElementFI))
		return moveRight()

	// When the cursor is at the start of an element and a backspace is pressed, or at the end of an element and a delete is pressed, move the cursor too.
	if (key === 'Backspace' && isCursorAtFIStart(activeElementFI) && !isCursorAtStart(FI, cursor))
		return moveLeft()
	if (key === 'Delete' && isCursorAtFIEnd(activeElementFI) && !isCursorAtEnd(FI, cursor))
		return moveRight()

	// Pass on to the appropriate child element.
	return identity()
}

export function canMoveCursorVertically(FI, up) {
	const activeElementFI = zoomIn(FI)
	const canMoveCursorVertically = getFIFuncs(activeElementFI).canMoveCursorVertically
	return canMoveCursorVertically ? canMoveCursorVertically(activeElementFI, up) : false
}

export function charElementClickToCursor(evt, FI, trace, charElements, equationElement) {
	const charPart = first(trace)
	const part = getFIFuncs(FI).charPartToValuePart(charPart)
	const element = getConstructPart(FI, part)

	// If no element can be traced, then most likely the user clicked on the function name. Return undefined to indicate we cannot use the element to trace the cursor position.
	if (!element)
		return undefined

	// All good. Pass on to the respective element.
	const newCursor = getFIFuncs(element).charElementClickToCursor(evt, element, trace.slice(1), charElements[charPart], equationElement)
	return newCursor === undefined ? undefined : {
		part,
		cursor: newCursor,
	}
}

export function coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement) {
	const charPart = getClosestElement(coordinates, boundsData)
	const part = getFIFuncs(FI).charPartToValuePart(charPart)
	const element = getConstructPart(FI, part)
	const newCursor = getFIFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[charPart], element, charElements[charPart], contentsElement)
	return newCursor === undefined ? undefined : {
		part,
		cursor: newCursor,
	}
}

export function getStartCursor(element) {
	const part = getFirstConstructPart(element)
	return { part, cursor: getFIStartCursor(getConstructPart(element, part)) }
}

export function getEndCursor(element) {
	const part = getFirstConstructPart(element, true)
	return { part, cursor: getFIEndCursor(getConstructPart(element, part)) }
}

export function isCursorAtStart(element, cursor) {
	const part = getFirstConstructPart(element)
	return cursor.part === part && isCursorAtFIStart(zoomIn({ ...element, cursor }))
}

export function isCursorAtEnd(element, cursor) {
	const part = getFirstConstructPart(element, true)
	return cursor.part === part && isCursorAtFIEnd(zoomIn({ ...element, cursor }))
}

export function isEmpty(value) {
	return getConstructPartNames(value).every(part => isFIEmpty(getConstructPart(value, part)))
}

export function cleanUp(FI, settings) {
	const { cursor } = FI
	const parts = getConstructPartNames(FI)

	// Clean up the parts individually, keeping track of the cursor.
	let newCursor = undefined
	const newValues = {}
	parts.forEach(part => {
		// Extract the element.
		const element = zoomInAt(FI, part)
		if (!element)
			return

		// Clean up the element if we can.
		const cleanUp = getFIFuncs(element).cleanUp
		const cleanedElement = cleanUp ? cleanUp(element, settings) : element

		// Extract the possibly adjusted cursor positions.
		if (cursor?.part === part)
			newCursor = { part, cursor: cleanedElement.cursor }
		newValues[part] = fromFI(cleanedElement).value ?? fromFI(cleanedElement)
	})

	// Assemble everything.
	return {
		...FI,
		...newValues,
		cursor: newCursor,
	}
}

export function removeElementFromExpression(expressionValue, partIndex, withBackspace) {
	// Find what we replace the element by.
	const element = expressionValue[partIndex]
	const removedElement = getFIFuncs(element).removeElement(element, withBackspace)
	const replacementValue = removedElement.type === 'Expression' ? removedElement.value : [fromFI(removedElement)]
	const replacementCursor = removedElement.type === 'Expression' ? removedElement.cursor : { part: 0, cursor: removedElement.cursor }

	// Check if the expression part after this function started with a closing bracket. So effectively, the function was empty. In that case, remove the closing bracket too.
	let expressionPartAfter = expressionValue[partIndex + 1]
	if (expressionPartAfter[0] === ')') {
		expressionPartAfter = expressionPartAfter.slice(1)
	}

	// Merge it all into a new expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex),
			...replacementValue,
			expressionPartAfter,
			...expressionValue.slice(partIndex + 2),
		],
		cursor: {
			part: partIndex + replacementCursor.part,
			cursor: replacementCursor.cursor,
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
