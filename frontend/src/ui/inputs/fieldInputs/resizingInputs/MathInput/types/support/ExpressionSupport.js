import { arraySplice } from 'step-wise/util'

import { removeCursor } from '../../../../FieldInput'

import { getFIFuncs } from '..'

import { zoomIn } from './zooming'

// getKeyPressHandlers returns a couple of handlers useful for key presses. It returns { passOn, moveLeft, moveRight } where passOn passes on the call to the active child element, moveLeft moves the cursor an element to the left and moveRight moves the cursor an element to the right.
export function getKeyPressHandlers(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { value, cursor } = FI
	const funcs = getFIFuncs(FI)
	const activeElementFI = zoomIn(FI)
	const activeElementFuncs = getFIFuncs(activeElementFI)

	const passOn = () => {
		const charPart = (funcs.valuePartToCharPart ? funcs.valuePartToCharPart(cursor.part) : cursor.part)
		const adjustedElement = activeElementFuncs.keyPressToFI(keyInfo, activeElementFI, settings, charElements && charElements[charPart], topParentFI, contentsElement, cursorElement)
		return {
			...FI,
			value: arraySplice(value, cursor.part, 1, removeCursor(adjustedElement)),
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		}
	}

	const moveLeft = () => {
		const part = cursor.part - 1
		const prevElement = value[part]
		return { ...FI, cursor: { part, cursor: getFIFuncs(prevElement).getEndCursor(prevElement.value) } } // Move to the end of the previous element.
	}

	const moveRight = () => {
		const part = cursor.part + 1
		const nextElement = value[part]
		return { ...FI, cursor: { part, cursor: getFIFuncs(nextElement).getStartCursor(nextElement.value) } } // Move to the start of the next element.
	}

	return { passOn, moveLeft, moveRight }
}

export function getDeepestExpression(FI) {
	// Zoom in until the end and remember the last expression we found.
	let deepestExpression = FI
	while (FI.cursor.part !== undefined) {
		FI = zoomIn(FI)
		if (FI.type === 'Expression')
			deepestExpression = FI
	}
	return deepestExpression
}
