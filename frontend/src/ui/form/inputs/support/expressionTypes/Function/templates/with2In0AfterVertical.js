// This is the template for functions like frac(...)(...) or SubSup which have two parameters that are vertically above each other.

import defaultFunctions from './with1In0After'

import { charElementsToBounds, getClosestElement } from '../../../MathWithCursor'

import { zoomIn, getFuncs, getDataStartCursor, getDataEndCursor, isCursorAtDataStart, isCursorAtDataEnd, isDataEmpty } from '../..'
import { findEndOfTerm, getSubExpression } from '../../support/ExpressionSupport'
import { mergeWithLeft, mergeWithRight } from '../../support/merging'
import { splitToLeft, splitToRight } from '../../support/splitting'

const allFunctions = {
	...defaultFunctions,
	create,
	getInitial,
	getInitialCursor,
	keyPressToData,
	canMoveCursorVertically,
	canMoveCursorOutside,
	coordinatesToCursor,
	merge,
	split,
	shouldRemove,
	removeElement,
}
export default allFunctions

function create(expressionData, part, position, name, alias) {
	let { value } = expressionData

	// Define cursors.
	const start = getDataStartCursor(expressionData)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const leftSide = findEndOfTerm({ ...expressionData, cursor: beforeAlias }, false, true)
	const rightSide = findEndOfTerm({ ...expressionData, cursor: beforeAlias }, true, false)
	const end = getDataEndCursor(expressionData)

	// Set up the arguments.
	const parameters = [
		{ type: 'Expression', value: getSubExpression(value, leftSide, beforeAlias) },
		{ type: 'Expression', value: getSubExpression(value, afterAlias, rightSide) },
	]

	// Set up the element.
	const functionElement = {
		type: 'Function',
		name,
	}
	const funcs = getFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias, parameters)

	// Build the new Expression around it.
	value = [
		...getSubExpression(value, start, leftSide),
		functionElement,
		...getSubExpression(value, rightSide, end),
	]
	return {
		...expressionData,
		value,
		cursor: {
			part: value.indexOf(functionElement),
			cursor: funcs.getInitialCursor(functionElement),
		},
	}
}

function getInitial(alias, parameters) {
	return parameters
}

function getInitialCursor(element) {
	// Find the first part that exists.
	const part = element.value.findIndex(elementPart => !!elementPart)
	return { part, cursor: getDataStartCursor(element.value[part]) }
}

function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const funcs = getFuncs(data)
	const { key } = keyInfo
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	// For up/down arrows, check if we can/need to move up.
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		const up = key === 'ArrowUp'

		// Only process this if we can move up/down but the child cannot. (Otherwise automatically pass it on to the child.)
		const canMoveCursorVertically = funcs.canMoveCursorVertically && funcs.canMoveCursorVertically(data, up)
		const canChildMoveCursorVertically = activeElementFuncs.canMoveCursorVertically && activeElementFuncs.canMoveCursorVertically(activeElementData, up)
		if (canMoveCursorVertically && !canChildMoveCursorVertically) {
			// Use the current cursor coordinates to get the appropriate cursor position.
			const upFirst = funcs.isUpFirst()
			const part = up === upFirst ? 0 : 1
			const element = data.value[part]
			const partCharElements = charElements[funcs.valuePartToCharPart(part)]
			const boundsData = charElementsToBounds(partCharElements)
			const cursorRect = cursorElement.getBoundingClientRect()
			const cursorMiddle = { x: (cursorRect.left + cursorRect.right) / 2, y: (cursorRect.top + cursorRect.bottom) / 2 }
			return {
				...data,
				cursor: {
					part,
					cursor: getFuncs(element).coordinatesToCursor(cursorMiddle, boundsData, element, partCharElements, contentsElement),
				}
			}
		}
	}

	// Process the key as usual.
	return defaultFunctions.keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement)
}

function canMoveCursorVertically(data, up) {
	// Check if we can move vertically in this part.
	const upFirst = getFuncs(data).isUpFirst()
	const { value, cursor } = data
	if ((cursor.part === 0 && up !== upFirst && value[1]) || (cursor.part === 1 && up === upFirst && value[0]))
		return true

	// Check if the child allows us to move vertically.
	return defaultFunctions.canMoveCursorVertically(data, up)
}

function canMoveCursorOutside(data, toRight) {
	return toRight ? isCursorAtDataEnd(zoomIn(data)) : isCursorAtDataStart(zoomIn(data))
}

function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const charPart = getClosestElement(coordinates, boundsData, false)
	const part = getFuncs(data).charPartToValuePart(charPart)
	const element = data.value[part]
	const newCursor = getFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[charPart], element, charElements[charPart], contentsElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	return mergeWithNext ? mergeWithRight(expressionValue, partIndex, fromOutside) : mergeWithLeft(expressionValue, partIndex, fromOutside)
}

function split(data) {
	const { cursor } = data
	return cursor.part === 0 ? splitToLeft(data) : splitToRight(data)
}

function shouldRemove(data) {
	return data.value.every(element => !element || isDataEmpty(element))
}

function removeElement(data) {
	const [num, den] = data.value
	return {
		type: 'Expression',
		value: [num, den],
		cursor: { part: 1, cursor: getDataStartCursor(den) },
	}
}