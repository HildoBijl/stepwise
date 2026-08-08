// This is the template for functions like frac(...)(...) or SubSup which have two parameters that are vertically above each other.

import { getSubExpression, findEndOfFactor, addExpressionWrapper } from '@step-wise/math-input-value'

import { charElementsToBounds, getClosestElement } from '../../..'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isCursorAtFIStart, isCursorAtFIEnd, isFIEmpty, zoomIn, createConstruct, getConstructPart, getFirstConstructPart } from '../..'
import { mergeWithLeft, mergeWithRight, splitToLeft, splitToRight } from '../../support'

import { allFunctions as defaultFunctions } from './with1In0After'

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
	const leftSide = findEndOfFactor(value, beforeAlias, false, true)
	const rightSide = findEndOfFactor(value, afterAlias, true, false)
	const end = getFIEndCursor(expressionFI)

	// Set up the arguments.
	const parameters = [
		addExpressionWrapper(getSubExpression(value, leftSide, beforeAlias)),
		addExpressionWrapper(getSubExpression(value, afterAlias, rightSide)),
	]

	// Set up the element.
	const functionElement = createConstruct(name, alias, parameters)
	const funcs = getFIFuncs(functionElement)

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
	const part = getFirstConstructPart(element)
	return { part, cursor: getFIStartCursor(getConstructPart(element, part)) }
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
			const parts = FI.type === 'Fraction' ? ['numerator', 'denominator'] : ['subscript', 'superscript']
			const part = parts[up === upFirst ? 0 : 1]
			const element = getConstructPart(FI, part)
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
	const { cursor } = FI
	const parts = FI.type === 'Fraction' ? ['numerator', 'denominator'] : ['subscript', 'superscript']
	if ((cursor.part === parts[0] && up !== upFirst && FI[parts[1]] !== undefined) || (cursor.part === parts[1] && up === upFirst && FI[parts[0]] !== undefined))
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
	const element = getConstructPart(FI, part)
	const newCursor = getFIFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[charPart], element, charElements[charPart], contentsElement)
	return newCursor === undefined ? undefined : {
		part,
		cursor: newCursor,
	}
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	return mergeWithNext ? mergeWithRight(FI, partIndex, fromOutside) : mergeWithLeft(FI, partIndex, fromOutside)
}

function split(FI) {
	const { cursor } = FI
	const firstPart = FI.type === 'Fraction' ? 'numerator' : 'subscript'
	return cursor.part === firstPart ? splitToLeft(FI) : splitToRight(FI)
}

function shouldRemove(FI) {
	return (FI.type === 'Fraction' ? ['numerator', 'denominator'] : ['subscript', 'superscript']).every(part => FI[part] === undefined || isFIEmpty(getConstructPart(FI, part)))
}

function removeElement(FI) {
	const num = { type: 'Expression', value: FI.numerator }
	const den = { type: 'Expression', value: FI.denominator }
	return {
		type: 'Expression',
		value: [...num.value, ...den.value],
		cursor: { part: num.value.length, cursor: getFIStartCursor(den).cursor },
	}
}
