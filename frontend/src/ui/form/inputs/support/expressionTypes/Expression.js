import { firstOf, lastOf, arraySplice, sum } from 'step-wise/util/arrays'
import { isEmpty, getEmpty } from 'step-wise/inputTypes/Expression'

import { addCursor, removeCursor } from '../Input'
import { toLatex as generalToLatex, keyPressToData as generalKeyPressToData, getStartCursor as generalGetStartCursor, getEndCursor as generalGetEndCursor, isCursorAtStart as generalIsCursorAtStart, isCursorAtEnd as generalIsCursorAtEnd, countNetBrackets as generalCountNetBrackets } from './index.js'

export function toLatex(value) {
	return value.map(generalToLatex).join(' ')
}

export function keyPressToData(keyInfo, data, contentsElement, expressionData, expressionContentsElement) {
	// ToDo: check transitions between elements.
	// const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// Pass on to the appropriate child element.
	const adjustedElement = generalKeyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), contentsElement, expressionData, expressionContentsElement)
	return {
		...data,
		value: arraySplice(value, cursor.part, 1, removeCursor(adjustedElement)),
		cursor: { ...cursor, cursor: adjustedElement.cursor },
	}
}

export function getStartCursor(value = getEmpty()) {
	return { part: 0, cursor: generalGetStartCursor(firstOf(value)) }
}

export function getEndCursor(value = getEmpty()) {
	return { part: value.length - 1, cursor: generalGetEndCursor(lastOf(value)) }
}

export function isCursorAtStart(value, cursor) {
	return cursor.part === 0 && generalIsCursorAtStart(addCursor(firstOf(value), cursor.cursor))
}

export function isCursorAtEnd(value, cursor) {
	return cursor.part === value.length - 1 && generalIsCursorAtEnd(addCursor(lastOf(value), cursor.cursor))
}

export { getEmpty, isEmpty }

// countNetBrackets counts the net number of opening minus closing brackets in a certain part of the expression. If relativeToCursor is 0, it's for the full expression. For -1 it's prior to the cursor and for 1 it's after the cursor.
export function countNetBrackets(data, relativeToCursor = 0) {
	const { value, cursor } = data

	// When we don't care about the cursor, we just sum everything up.
	if (relativeToCursor === 0)
		return sum(value.map(generalCountNetBrackets))

	// When we do care about the cursor, we find the right range and add up for that range, also taking into account the element itself.
	const arrayPart = (relativeToCursor === -1 ? value.slice(0, cursor.part) : value.slice(cursor.part + 1))
	return sum(arrayPart.map(generalCountNetBrackets)) + generalCountNetBrackets(addCursor(value[cursor.part], cursor.cursor), relativeToCursor)
}