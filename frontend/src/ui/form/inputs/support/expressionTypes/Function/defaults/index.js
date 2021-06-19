// This is the most general template for settings up equation function objects, like sqrt, log, etcetera. It has default functionalities for most basic cases.

import { firstOf, lastOf, arraySplice } from 'step-wise/util/arrays'

import { removeCursor } from '../../../Input'
import { getClosestElement } from '../../../MathWithCursor'

import { getFuncs, zoomIn, getDataStartCursor, getDataEndCursor, isCursorAtDataStart, isCursorAtDataEnd, isDataEmpty } from '../../'
import { getEmpty as getEmptyExpression } from '../../Expression'

const allFunctions = {
	create,
	toLatex,
	getCursorProperties,
	keyPressToData,
	charElementClickToCursor,
	coordinatesToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	getEmpty,
	isEmpty,
}
export default allFunctions

function create(expressionData, part, position, name, alias) {
	// Set up the new function element.
	const functionElement = { type: 'Function', name, alias }
	functionElement.value = getFuncs(functionElement).getEmpty()

	// Set up the adjusted expression.
	const { value, cursor } = expressionData
	const expressionPartValue = value[part].value
	const newValue = [
		...value.slice(0, part),
		{ type: 'ExpressionPart', value: expressionPartValue.substring(0, position) },
		functionElement,
		{ type: 'ExpressionPart', value: expressionPartValue.substring(position + alias.length) },
		...value.slice(part + 1),
	]

	// Figure out where to put the cursor.
	let newCursor
	if (!cursor)
		newCursor = null
	else if (cursor.part < part)
		newCursor = cursor // Keep it where it is.
	else if (cursor.part > part)
		newCursor = { part: cursor.part + 2, cursor: cursor.cursor } // Keep it where it is, but two parts have been added prior to it.
	else
		newCursor = { part: cursor.part + 2, cursor: 0 } // Move right after the new function.

	// All done!
	return {
		...expressionData,
		value: newValue,
		cursor: newCursor,
	}
}

function toLatex(data) {
	throw new Error(`Missing function error: the function component "${data && data.name}" has not implemented the toLatex function.`)
}

function getCursorProperties(data, charElements, container) {
	const { cursor } = data
	const activeElementData = zoomIn(data)
	return getFuncs(activeElementData).getCursorProperties(activeElementData, charElements[cursor.part], container)
}

function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	// When we want to pass this on to the child element, we have this custom function.
	const { value, cursor } = data
	const passOn = () => {
		const adjustedElement = activeElementFuncs.keyPressToData(keyInfo, activeElementData, charElements[cursor.part], topParentData, contentsElement, cursorElement)
		const newValue = arraySplice(value, cursor.part, 1, removeCursor(adjustedElement))
		return {
			...data,
			value: newValue,
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		}
	}

	// ToDo: consider if some inter-parameter movement is required.

	// Pass on to the appropriate child element.
	return passOn()
}

function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
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

function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const part = getClosestElement(coordinates, boundsData)
	const element = data.value[part]
	const newCursor = getFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[part], element, charElements[part], contentsElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

function getStartCursor(value) {
	return { part: 0, cursor: getDataStartCursor(firstOf(value)) }
}

function getEndCursor(value) {
	return { part: value.length - 1, cursor: getDataEndCursor(lastOf(value)) }
}

function isCursorAtStart(value, cursor) {
	const data = { type: 'Function', value, cursor }
	return cursor.part === 0 && isCursorAtDataStart(zoomIn(data))
}

function isCursorAtEnd(value, cursor) {
	const data = { type: 'Function', value, cursor }
	return cursor.part === value.length - 1 && isCursorAtDataEnd(zoomIn(data))
}

function getEmpty(numParameters = 1) {
	return (new Array(numParameters)).fill(0).map(() => ({ type: 'Expression', value: getEmptyExpression() }))
}

function isEmpty(value) {
	return value.every(element => isDataEmpty(element))
}
