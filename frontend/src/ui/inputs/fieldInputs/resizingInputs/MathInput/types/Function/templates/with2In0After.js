// This is the template for functions like root(...) which have a parameter after their term but also have a parameter earlier, like root[3](8).

import { getFIFuncs, getFIStartCursor, isCursorAtFIStart, isCursorAtFIEnd, zoomIn } from '../..'
import { mergeWithLeft, mergeWithRight, splitToLeft, splitToRight } from '../../support'

import { allFunctions as defaultFunctions } from './with1In0After'

export const allFunctions = {
	...defaultFunctions,
	getInitial,
	getInitialCursor,
	keyPressToFI,
	merge,
	split,
	onClosingBracketGoOutside: true,
}

function getInitial(alias, parameter) {
	return [
		{
			type: 'Expression',
			value: [{
				type: 'ExpressionPart',
				value: '',
			}]
		},
		parameter,
	]
}

function getInitialCursor(element) {
	return { part: 1, cursor: getFIStartCursor(element.value[1]) }
}

function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { key } = keyInfo
	const activeElementFI = zoomIn(FI)

	// When the cursor is at the start of an element and a backspace is pressed, or at the end of an element and a delete is pressed remove this element.
	if (key === 'Backspace' && isCursorAtFIStart(activeElementFI) && !isCursorAtFIStart(FI))
		return getFIFuncs(FI).removeElement(FI, true)
	if (key === 'Delete' && isCursorAtFIEnd(activeElementFI) && !isCursorAtFIEnd(FI))
		return getFIFuncs(FI).removeElement(FI, false)

	// Process the key as usual.
	return defaultFunctions.keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	return mergeWithNext ? mergeWithRight(FI, partIndex, fromOutside) : mergeWithLeft(FI, partIndex, fromOutside)
}

function split(FI) {
	const { cursor } = FI
	return cursor.part === 0 ? splitToLeft(FI) : splitToRight(FI)
}
