// This is the template for functions like frac(...)(...) or SubSup which have two parameters that are vertically above each other.

import { support } from 'step-wise/CAS'

import { charElementsToBounds, getClosestElement } from '../../..'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isCursorAtFIStart, isCursorAtFIEnd, isFIEmpty, zoomIn } from '../..'
import { mergeWithLeft, mergeWithRight, splitToLeft, splitToRight } from '../../support'

import { allFunctions as defaultFunctions } from './with1In0After'

const { getSubExpression, findEndOfTerm, addExpressionType } = support

export const allFunctions = {
	...defaultFunctions,
	create,
	getInitial,
	getInitialCursor,
	keyPressToFI,
	canMoveCursorVertically,
	canMoveCursorOutside,
	coordinatesToCursor,
	merge,
	split,
	shouldRemove,
	removeElement,
	onClosingBracketGoOutside: false,
}

function create(expressionFI, part, position, name, alias) {
	let { value } = expressionFI

	// Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const leftSide = findEndOfTerm(value, beforeAlias, false, true)
	const rightSide = findEndOfTerm(value, afterAlias, true, false)
	const end = getFIEndCursor(expressionFI)

	// Set up the arguments.
	const parameters = [
		addExpressionType(getSubExpression(value, leftSide, beforeAlias)),
		addExpressionType(getSubExpression(value, afterAlias, rightSide)),
	]

	// Set up the element.
	const functionElement = {
		type: 'Function',
		name,
	}
	const funcs = getFIFuncs(functionElement)
	functionElement.value = funcs.getInitial(alias, parameters)

	// Build the new Expression around it.
	value = [
		...getSubExpression(value, start, leftSide),
		functionElement,
		...getSubExpression(value, rightSide, end),
	]
	return {
		...expressionFI,
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
	return { part, cursor: getFIStartCursor(element.value[part]) }
}

function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const funcs = getFIFuncs(FI)
	const { key } = keyInfo
	const activeElementFI = zoomIn(FI)
	const activeElementFuncs = getFIFuncs(activeElementFI)

	// For up/down arrows, check if we can/need to move up.
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		const up = key === 'ArrowUp'

		// Only process this if we can move up/down but the child cannot. (Otherwise automatically pass it on to the child.)
		const canMoveCursorVertically = funcs.canMoveCursorVertically && funcs.canMoveCursorVertically(FI, up)
		const canChildMoveCursorVertically = activeElementFuncs.canMoveCursorVertically && activeElementFuncs.canMoveCursorVertically(activeElementFI, up)
		if (canMoveCursorVertically && !canChildMoveCursorVertically) {
			// Use the current cursor coordinates to get the appropriate cursor position.
			const upFirst = funcs.isUpFirst()
			const part = up === upFirst ? 0 : 1
			const element = FI.value[part]
			const partCharElements = charElements[funcs.valuePartToCharPart(part)]
			const boundsData = charElementsToBounds(partCharElements)
			const cursorRect = cursorElement.getBoundingClientRect()
			const cursorMiddle = { x: (cursorRect.left + cursorRect.right) / 2, y: (cursorRect.top + cursorRect.bottom) / 2 }
			return {
				...FI,
				cursor: {
					part,
					cursor: getFIFuncs(element).coordinatesToCursor(cursorMiddle, boundsData, element, partCharElements, contentsElement),
				}
			}
		}
	}

	// Process the key as usual.
	return defaultFunctions.keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)
}

function canMoveCursorVertically(FI, up) {
	// Check if we can move vertically in this part.
	const upFirst = getFIFuncs(FI).isUpFirst()
	const { value, cursor } = FI
	if ((cursor.part === 0 && up !== upFirst && value[1]) || (cursor.part === 1 && up === upFirst && value[0]))
		return true

	// Check if the child allows us to move vertically.
	return defaultFunctions.canMoveCursorVertically(FI, up)
}

function canMoveCursorOutside(FI, toRight) {
	return toRight ? isCursorAtFIEnd(zoomIn(FI)) : isCursorAtFIStart(zoomIn(FI))
}

function coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement) {
	const charPart = getClosestElement(coordinates, boundsData, false)
	const part = getFIFuncs(FI).charPartToValuePart(charPart)
	const element = FI.value[part]
	const newCursor = getFIFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[charPart], element, charElements[charPart], contentsElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	return mergeWithNext ? mergeWithRight(FI, partIndex, fromOutside) : mergeWithLeft(FI, partIndex, fromOutside)
}

function split(FI) {
	const { cursor } = FI
	return cursor.part === 0 ? splitToLeft(FI) : splitToRight(FI)
}

function shouldRemove(FI) {
	return FI.value.every(element => !element || isFIEmpty(element))
}

function removeElement(FI) {
	const [num, den] = FI.value
	return {
		type: 'Expression',
		value: [num, den],
		cursor: { part: 1, cursor: getFIStartCursor(den) },
	}
}