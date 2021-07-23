import { arraySplice } from 'step-wise/util/arrays'
import { isObject } from 'step-wise/util/objects'

import { removeCursor } from '../../Input'
import { getFuncs, zoomIn } from '../index.js'

// getKeyPressHandlers returns a couple of handlers useful for key presses. It returns { passOn, moveLeft, moveRight } where passOn passes on the call to the active child element, moveLeft moves the cursor an element to the left and moveRight moves the cursor an element to the right.
export function getKeyPressHandlers(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { value, cursor } = data
	const funcs = getFuncs(data)
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	const passOn = () => {
		const charPart = (funcs.valuePartToCharPart ? funcs.valuePartToCharPart(cursor.part) : cursor.part)
		const adjustedElement = activeElementFuncs.keyPressToData(keyInfo, activeElementData, charElements && charElements[charPart], topParentData, contentsElement, cursorElement)
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

// findEndOfTerm searches for the end of a term. When you have an expression like a*cos(b+c/d+e)sin(2x)+3, and you put a "/" sign right before "sin", then we need to know which parts need to go in the fraction. We can go right (toRight = true) and left (toRight = false) and find the cursor positions of the respective endings of the terms. Basically, the term ends whenever we encounter a +, - or * and we are not still within brackets.
export function findEndOfTerm(data, toRight = true, skipFirst = false, initialBracketCount = 0, returnOnZeroCount = false) {
	const { value, cursor } = data

	// Define iterators: parameters that will change as we go.
	let { part: partIterator, cursor: cursorIterator } = cursor
	let bracketCount = initialBracketCount

	// Define functions that will be needed while iterating.
	const hasNextSymbol = () => {
		if (toRight)
			return partIterator < value.length - 1 || cursorIterator < value[partIterator].value.length // Before the end of the last part?
		return partIterator > 0 || cursorIterator > 0 // After the start of the first part?
	}
	const getNextSymbol = () => {
		const currentString = value[partIterator].value
		if (toRight) { // To the right.
			// At the end of a string?
			if (cursorIterator === currentString.length)
				return value[partIterator + 1] // Return next special element.
			return currentString[cursorIterator] // Return next character.
		} else { // To the left.
			// At the start of a string?
			if (cursorIterator === 0)
				return value[partIterator - 1] // Return previous special element.
			return currentString[cursorIterator - 1] // Return previous character.
		}
	}
	const shiftCursor = () => {
		if (toRight) { // To the right.
			// If we are at the end of a string, move to the start of the next string. Otherwise just shift the cursor.
			if (cursorIterator === value[partIterator].value.length) {
				partIterator += 2
				cursorIterator = 0
			} else {
				cursorIterator++
			}
		} else { // To the left.
			// If we are at the start of a string, move to the end of the previous string. Otherwise just shift the cursor.
			if (cursorIterator === 0) {
				partIterator -= 2
				cursorIterator = value[partIterator].value.length
			} else {
				cursorIterator--
			}
		}
	}

	// Iterate over the expression.
	let first = true
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// Check if we have a zero bracket count and are ordered to return then.
		if (returnOnZeroCount && bracketCount === 0)
			return { part: partIterator, cursor: cursorIterator }

		// On an encountered function (not a subSup) return the current cursor position, unless we're inside brackets.
		if (isObject(nextSymbol) && nextSymbol.type === 'Function' && nextSymbol.name !== 'subSup') {
			if (bracketCount === 0 && (!skipFirst || !first))
				return { part: partIterator, cursor: cursorIterator }
			const netBracketCountFunc = getFuncs(nextSymbol).netBracketCount
			const netBracketCount = netBracketCountFunc ? netBracketCountFunc(nextSymbol) : 0
			bracketCount += (toRight ? 1 : -1) * netBracketCount
		}

		// On a breaking character, return the current cursor position. 
		if (bracketCount === 0 && ['+', '-', '*'].includes(nextSymbol) && (!skipFirst || !first))
			return { part: partIterator, cursor: cursorIterator }

		// On a bracket, adjust the bracket count. If it drops below zero, return the current cursor position too.
		if (nextSymbol === '(') {
			bracketCount += toRight ? 1 : -1
			if (!toRight && bracketCount < 0)
				return { part: partIterator, cursor: cursorIterator }
		} else if (nextSymbol === ')') {
			bracketCount += toRight ? -1 : 1
			if (toRight && bracketCount < 0)
				return { part: partIterator, cursor: cursorIterator }
		}
		if (bracketCount < 0 && (!skipFirst || !first))
			return { part: partIterator, cursor: cursorIterator }

		// All good so far! Shift the cursor and check out the next symbol.
		shiftCursor()
		first = false
	}

	// We're at the end. Return the current cursor position.
	return { part: partIterator, cursor: cursorIterator }
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