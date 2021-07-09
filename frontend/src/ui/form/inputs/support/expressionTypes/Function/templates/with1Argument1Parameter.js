// This is the template for functions like root(...) which have a parameter after their term but also have a parameter earlier, like root[3](8).

import { getFuncs, zoomIn, getDataStartCursor, isCursorAtDataStart, isCursorAtDataEnd } from '../..'
import { mergeWithLeft, mergeWithRight } from '../../support/merging'
import { splitToLeft, splitToRight } from '../../support/splitting'

import defaultFunctions from './with1Argument0Parameter'

const allFunctions = {
	...defaultFunctions,
	getInitial,
	getInitialCursor,
	keyPressToData,
	merge,
	split,
}
export default allFunctions

function getInitial(alias, parameter) {
	return [
		{
			type: 'Expression',
			value: [{
				type: 'ExpressionPart',
				value: '2',
			}]
		},
		parameter,
	]
}

function getInitialCursor(element) {
	return { part: 1, cursor: getDataStartCursor(element.value[1]) }
}

function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const activeElementData = zoomIn(data)

	// When the cursor is at the start of an element and a backspace is pressed, or at the end of an element and a delete is pressed remove this element.
	if (key === 'Backspace' && isCursorAtDataStart(activeElementData) && !isCursorAtDataStart(data))
		return getFuncs(data).removeElement(data, true)
	if (key === 'Delete' && isCursorAtDataEnd(activeElementData) && !isCursorAtDataEnd(data))
		return getFuncs(data).removeElement(data, false)

	// Process the key as usual.
	return defaultFunctions.keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement)
}

function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	return mergeWithNext ? mergeWithRight(expressionValue, partIndex, fromOutside) : mergeWithLeft(expressionValue, partIndex, fromOutside)
}

function split(data) {
	const { cursor } = data
	return cursor.part === 0 ? splitToLeft(data) : splitToRight(data)
}