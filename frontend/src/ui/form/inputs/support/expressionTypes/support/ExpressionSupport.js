import { arraySplice } from 'step-wise/util/arrays'

import { removeCursor } from '../../Input'
import { getFuncs, zoomIn } from '../index.js'

// getKeyPressHandlers returns a couple of handlers useful for key presses. It returns { passOn, moveLeft, moveRight } where passOn passes on the call to the active child element, moveLeft moves the cursor an element to the left and moveRight moves the cursor an element to the right.
export function getKeyPressHandlers(keyInfo, data, settings, charElements, topParentData, contentsElement, cursorElement) {
	const { value, cursor } = data
	const funcs = getFuncs(data)
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	const passOn = () => {
		const charPart = (funcs.valuePartToCharPart ? funcs.valuePartToCharPart(cursor.part) : cursor.part)
		const adjustedElement = activeElementFuncs.keyPressToData(keyInfo, activeElementData, settings, charElements && charElements[charPart], topParentData, contentsElement, cursorElement)
		return {
			...data,
			value: arraySplice(value, cursor.part, 1, removeCursor(adjustedElement)),
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		}
	}

	const moveLeft = () => {
		const part = cursor.part - 1
		const prevElement = value[part]
		return { ...data, cursor: { part, cursor: getFuncs(prevElement).getEndCursor(prevElement.value) } } // Move to the end of the previous element.
	}

	const moveRight = () => {
		const part = cursor.part + 1
		const nextElement = value[part]
		return { ...data, cursor: { part, cursor: getFuncs(nextElement).getStartCursor(nextElement.value) } } // Move to the start of the next element.
	}

	return { passOn, moveLeft, moveRight }
}

export function getDeepestExpression(data) {
	// Zoom in until the end and remember the last expression we found.
	let deepestExpression = data
	while (data.cursor.part !== undefined) {
		data = zoomIn(data)
		if (data.type === 'Expression')
			deepestExpression = data
	}
	return deepestExpression
}