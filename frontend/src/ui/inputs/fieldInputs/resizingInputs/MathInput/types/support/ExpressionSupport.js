
import { getFIFuncs, getFIStartCursor, getFIEndCursor } from '..'

import { zoomIn, fromFI } from './zooming'
import { getConstructPart, getConstructPartNames } from './constructs'

// getKeyPressHandlers returns a couple of handlers useful for key presses. It returns { identity, moveLeft, moveRight } where identity passes on the call to the active child element, moveLeft moves the cursor an element to the left and moveRight moves the cursor an element to the right.
export function getKeyPressHandlers(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { cursor } = FI
	const funcs = getFIFuncs(FI)
	const activeElementFI = zoomIn(FI)
	const activeElementFuncs = getFIFuncs(activeElementFI)

	const identity = () => {
		const charPart = (funcs.valuePartToCharPart ? funcs.valuePartToCharPart(cursor.part) : cursor.part)
		const adjustedElement = activeElementFuncs.keyPressToFI(keyInfo, activeElementFI, settings, charElements && charElements[charPart], topParentFI, contentsElement, cursorElement)
		if (FI.type === 'Expression' || FI.type === 'Equation') {
			if (adjustedElement.type === 'Expression') {
				return {
					...FI,
					value: FI.value.toSpliced(cursor.part, 1, ...adjustedElement.value),
					cursor: { part: cursor.part + adjustedElement.cursor.part, cursor: adjustedElement.cursor.cursor },
				}
			}
			return { ...FI, value: FI.value.toSpliced(cursor.part, 1, fromFI(adjustedElement)), cursor: { ...cursor, cursor: adjustedElement.cursor } }
		}
		return { ...FI, [cursor.part]: adjustedElement.value, cursor: { ...cursor, cursor: adjustedElement.cursor } }
	}

	const moveLeft = () => {
		if (FI.type === 'Expression' || FI.type === 'Equation') {
			const part = cursor.part - 1
			const previousElement = FI.value[part]
			return { ...FI, cursor: { part, cursor: getFIEndCursor(previousElement) } } // Move to the end of the previous element.
		}
		const parts = getConstructPartNames(FI)
		const part = parts[parts.indexOf(cursor.part) - 1]
		return { ...FI, cursor: { part, cursor: getFIEndCursor(getConstructPart(FI, part)) } }
	}

	const moveRight = () => {
		if (FI.type === 'Expression' || FI.type === 'Equation') {
			const part = cursor.part + 1
			const nextElement = FI.value[part]
			return { ...FI, cursor: { part, cursor: getFIStartCursor(nextElement) } } // Move to the start of the next element.
		}
		const parts = getConstructPartNames(FI)
		const part = parts[parts.indexOf(cursor.part) + 1]
		return { ...FI, cursor: { part, cursor: getFIStartCursor(getConstructPart(FI, part)) } }
	}

	return { identity, moveLeft, moveRight }
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
