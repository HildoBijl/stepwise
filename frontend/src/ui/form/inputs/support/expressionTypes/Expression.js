import { insertAtIndex } from 'step-wise/util/strings'
import { firstOf, lastOf, arraySplice, sum } from 'step-wise/util/arrays'
import { repeatWithIndices } from 'step-wise/util/functions'
import { isEmpty, getEmpty } from 'step-wise/inputTypes/Expression'

import { addCursor, removeCursor } from '../Input'
import * as General from './index.js'
import * as ExpressionPart from './ExpressionPart'

export function toLatex(value) {
	return processExpressionPartBrackets(value.map(General.toLatex)).join(' ')
}

export function getLatexChars(value) {
	return value.map(General.getLatexChars)
}

export function getCursorProperties(data, charElements, container) {
	const { cursor, value } = data
	return General.getCursorProperties({
		...value[cursor.part],
		cursor: cursor.cursor,
	}, charElements[cursor.part], container)
}

export function keyPressToData(keyInfo, data, charElements, mainExpressionData, mainExpressionElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[cursor.part], mainExpressionData, mainExpressionElement)
		return cleanUp({
			...data,
			value: arraySplice(value, cursor.part, 1, removeCursor(adjustedElement)),
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		})
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// Get the active element.
	const cursorElement = value[cursor.part]
	const cursorElementCursor = cursor.cursor
	const cursorElementData = addCursor(cursorElement, cursorElementCursor)

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part > 0 && General.isCursorAtStart(cursorElementData)) {
		const part = cursor.part - 1
		return { ...data, cursor: { part, cursor: General.getEndCursor(value[part]) } } // Move to the end of the previous element.
	}
	if (key === 'ArrowRight' && cursor.part < value.length - 1 && General.isCursorAtEnd(cursorElementData)) {
		const part = cursor.part + 1
		return { ...data, cursor: { part, cursor: General.getStartCursor(value[part]) } } // Move to the start of the next element.
	}
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value) }

	// On divisions create a fraction.
	if (key === '/' || key === 'Divide') {
		// If the cursor is in a special part (not a string) then pass it on.
		if (value[cursor.part].type !== 'ExpressionPart')
			return passOn()

		// We must create a fraction! First find what needs to be put in the fraction. Find the cursor endings.
		const leftCursor = findEndOfTerm(data, false)
		const rightCursor = findEndOfTerm(data, true)

		// Then set up the numerator and denominator for the fraction.
		const num = { type: 'Expression', value: getSubExpression(value, leftCursor, cursor) }
		const den = { type: 'Expression', value: getSubExpression(value, cursor, rightCursor) }
		const fraction = { type: 'Fraction', value: { num, den } }

		// Gather all remaining parts, clean it up and return it.
		const newValue = [
			...getSubExpression(value, getStartCursor(value), leftCursor),
			fraction,
			...getSubExpression(value, rightCursor, getEndCursor(value)),
		]
		const newCursor = { part: newValue.indexOf(fraction), cursor: { part: 'den', cursor: getStartCursor(fraction.value.den.value) } }
		return cleanUp({
			...data,
			value: newValue,
			cursor: newCursor,
		})
	}

	// Pass on to the appropriate child element.
	return passOn()
}

// findEndOfTerm searches for the end of a term. When you have an expression like a*(b+c/d+e)sin(2x)+3, and you put a "/" sign right before "sin", then we need to know which parts need to go in the fraction. We can go right (direction = true) and left (direction = false) and find the cursor positions of the respective endings of the terms. Basically, the term ends whenever we encounter a +, - or * and we are not still within brackets.
export function findEndOfTerm(data, direction = true) {
	const { value, cursor } = data

	// Define iterators: parameters that will change as we go.
	let { part: partIterator, cursor: cursorIterator } = cursor
	let bracketCount = 0

	// Define functions that will be needed while iterating.
	const hasNextSymbol = () => {
		if (direction)
			return partIterator < value.length - 1 || cursorIterator < value[partIterator].value.length // Before the end of the last part?
		return partIterator > 0 || cursorIterator > 0 // After the start of the first part?
	}
	const getNextSymbol = () => {
		const currentString = value[partIterator].value
		if (direction) { // To the right.
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
		if (direction) { // To the right.
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
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// On a breaking character, return the current cursor position. 
		if (bracketCount === 0 && ['+', '-', '*'].includes(nextSymbol))
			return { part: partIterator, cursor: cursorIterator }

		// On a bracket, adjust the bracket count. If it drops below zero, return the current cursor position too.
		if (nextSymbol === '(')
			bracketCount += direction ? 1 : -1
		else if (nextSymbol === ')')
			bracketCount += direction ? -1 : 1
		if (bracketCount < 0)
			return { part: partIterator, cursor: cursorIterator }

		// All good so far! Shift the cursor and check out the next symbol.
		shiftCursor()
	}

	// We're at the end. Return the current cursor position.
	return { part: partIterator, cursor: cursorIterator }
}

// getSubExpression gets an expression array (the value) and returns the expression between the left and the right cursor. The right cursor MUST be to the right (or equal to) the left cursor. Both cursors must be in an ExpressionPart (string) part of the expression array. The returned value is a value-array too.
export function getSubExpression(value, left, right) {
	// Are the cursors in the same part? If so, return an expression with just one ExpressionPart.
	if (left.part === right.part) {
		const element = value[left.part]
		return [{
			...element,
			value: element.value.substring(left.cursor, right.cursor),
		}]
	}

	// Assemble the new expression array step by step, with the left part, the in-between parts, and the right part.
	const newValue = []
	newValue.push({ type: 'ExpressionPart', value: value[left.part].value.substring(left.cursor) })
	repeatWithIndices(left.part + 1, right.part - 1, (index) => newValue.push(value[index]))
	newValue.push({ type: 'ExpressionPart', value: value[right.part].value.substring(0, right.cursor) })

	// All done! Run a clean-up and return the result.
	return cleanUp({ type: 'Expression', value: newValue }).value
}

// cleanUp takes an expression and cleans it up. While doing so, the respective cursor is kept in the same place.
export function cleanUp(data) {
	// Step 1 is to flatten all expressions inside of the expression array.
	data = flattenExpressionArray(data)

	// Step 2 is to ensure that the expression consists of alternating ExpressionParts (even indices) and alternating other parts (odd indices).
	return alternateExpressionParts(data)
}

// flattenExpressionArray will take an expression data object and walk through the array. If there is an expression as an element, this expression is expanded. So an expression like ['a*', ['b','c'], '+d'] will be flattened to a single array. Flattening is done recursively. The cursor will be kept on the same place in the respective element.
function flattenExpressionArray(data) {
	const { value, cursor } = data

	// If there is no cursor, just flatten the arrays.
	if (!cursor)
		return { ...data, value: flattenExpressionArraysFromValue(value) }

	// There is a cursor. Find the element the cursor is in, so we can track it later on.
	let valueIterator = value
	let cursorIterator = cursor
	while (valueIterator[cursorIterator.part].type === 'Expression') {
		valueIterator = valueIterator[cursorIterator.part].value
		cursorIterator = cursorIterator.cursor
	}
	const cursorElement = valueIterator[cursorIterator.part]
	const cursorElementCursor = cursorIterator.cursor

	// Flatten the expression array.
	let newValue = flattenExpressionArraysFromValue(value)

	// Retrace the position of the cursor.
	let newCursor = {
		part: newValue.indexOf(cursorElement),
		cursor: cursorElementCursor,
	}

	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}

function flattenExpressionArraysFromValue(value) {
	return value.map(element => element.type === 'Expression' ? flattenExpressionArraysFromValue(element.value) : element).flat()
}

function alternateExpressionParts(data) {
	const { value, cursor } = data

	// Check a special case.
	if (value.length === 0)
		return { type: 'Expression', value: getEmpty(), cursor: getStartCursor() }

	// Set up result parameters.
	const newValue = []
	let newCursor = null // Will be assigned once we get to the element the cursor points to.

	// Ensure an expression part at the start.
	newValue.push({ type: 'ExpressionPart', value: ExpressionPart.getEmpty() })

	// Walk through all elements and add them one by one in the appropriate way.
	value.forEach((element, index) => {
		const lastAddedElement = lastOf(newValue)
		if (element.type === 'ExpressionPart' && lastAddedElement.type === 'ExpressionPart') {
			// Two ExpressionParts in a row. Merge them. And if the cursor is in the new ExpressionPart, position it appropriately.
			if (cursor && cursor.part === index)
				newCursor = { part: newValue.length - 1, cursor: lastAddedElement.value.length + cursor.cursor }
			newValue[newValue.length - 1] = { ...lastAddedElement, value: lastAddedElement.value + element.value }
		} else {
			// If there are two special parts in a row, add an empty ExpressionPart in-between.
			if (element.type !== 'ExpressionPart' && lastAddedElement.type !== 'ExpressionPart')
				newValue.push({ type: 'ExpressionPart', value: ExpressionPart.getEmpty() })

			// Add the new part and keep the cursor on it if needed.
			newValue.push(element)
			if (cursor && cursor.part === index)
				newCursor = { ...cursor, part: newValue.length - 1 }
		}
	})

	// Ensure an expression part at the end.
	if (lastOf(newValue).type !== 'ExpressionPart')
		newValue.push({ type: 'ExpressionPart', value: ExpressionPart.getEmpty() })

	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}

export function getStartCursor(value = getEmpty()) {
	return { part: 0, cursor: General.getStartCursor(firstOf(value)) }
}

export function getEndCursor(value = getEmpty()) {
	return { part: value.length - 1, cursor: General.getEndCursor(lastOf(value)) }
}

export function isCursorAtStart(value, cursor) {
	return cursor.part === 0 && General.isCursorAtStart(addCursor(firstOf(value), cursor.cursor))
}

export function isCursorAtEnd(value, cursor) {
	return cursor.part === value.length - 1 && General.isCursorAtEnd(addCursor(lastOf(value), cursor.cursor))
}

export { getEmpty, isEmpty }

export function getDeepestExpression(data) {
	// Follow the cursor until we're nearly the end.
	let { value, cursor } = data
	while (data.value[cursor.part].type !== 'ExpressionPart') {
		data = value[cursor.part]
		cursor = cursor.cursor
		value = data.value
	}
	return {
		...data,
		cursor,
	}
}

// countNetBrackets counts the net number of opening minus closing brackets in a certain part of the expression. If relativeToCursor is 0, it's for the full expression. For -1 it's prior to the cursor and for 1 it's after the cursor. When the cursor is used, we assume it's in an ExpressionPart element.
export function countNetBrackets(data, relativeToCursor = 0) {
	const { value, cursor } = data

	// When we don't care about the cursor, we just sum everything up.
	if (relativeToCursor === 0)
		return sum(value.map(element => element.type === 'ExpressionPart' ? ExpressionPart.countNetBrackets(element) : 0))

	// We care about the cursor. Check that the cursor is in an ExpressionPart element.
	if (value[cursor.part].type !== 'ExpressionPart')
		throw new Error(`Invalid equation function call: called countNetBrackets for an Expression while the cursor was not in an ExpressionPart of that expression.`)

	// Find the right range and add up for that range, also taking into account the element itself.
	const arrayPart = (relativeToCursor === -1 ? value.slice(0, cursor.part) : value.slice(cursor.part + 1))
	const netBracketsInPreviousParts = sum(arrayPart.map(element => element.type === 'ExpressionPart' ? ExpressionPart.countNetBrackets(element) : 0))
	const netBracketsInCurrentPart = ExpressionPart.countNetBrackets(addCursor(value[cursor.part], cursor.cursor), relativeToCursor)
	return netBracketsInPreviousParts + netBracketsInCurrentPart
}

// processExpressionPartBrackets takes an array of Latex-strings and matches the brackets inside all strings. It does this only for the even-numbered elements, which are the ExpressionParts.
function processExpressionPartBrackets(arr) {
	// Walk through the ExpressionParts, one by one and inside. Memorize opening brackets. Whenever we encounter a closing bracket, match it to the previous opening backet.
	let openingBrackets = []
	arr.forEach((_, index) => {
		// Keep non-expression-parts as is.
		if (index % 2 === 1)
			return

		// Walk through the string.
		for (let char = 0; char < arr[index].length; char++) {
			if (arr[index][char] === '(') { // Opening bracket?
				openingBrackets.push({ index, char }) // Remember the opening bracket.
			} else if (arr[index][char] === ')') { // Closing bracket?
				const matchingBracket = openingBrackets.pop()
				if (matchingBracket !== undefined) { // Matching opening bracket? Couple them.
					const addRight = '\\right'
					const addLeft = '\\left'
					arr[index] = insertAtIndex(arr[index], char, addRight)
					arr[matchingBracket.index] = insertAtIndex(arr[matchingBracket.index], matchingBracket.char, addLeft)
					char += (index === matchingBracket.index ? addLeft.length : 0) + addRight.length // These characters were added. To prevent an infinite loop, add this length to the char iterator.
				} else { // No matching opening bracket. Add a \. at the start of the ExpressionPart.
					const addRight = '\\right'
					const addLeft = '\\left.\\hspace{-0\\.12em}' // Add negative space to prevent the \. from distorting the layout. Also, escape the period in the negative space due to our own system changing periods to commas on some language settings.
					arr[index] = insertAtIndex(arr[index], char, addRight) // Close off the bracket.
					arr[index] = insertAtIndex(arr[index], 0, addLeft)
					char += addLeft.length + addRight.length // These characters were added. To prevent an infinite loop, add this length to the char iterator.
				}
			}
		}
	})

	// Close off remaining opening brackets by adding \. on the end of the respective strings.
	while (openingBrackets.length > 0) {
		const openingBracket = openingBrackets.pop()
		arr[openingBracket.index] = insertAtIndex(arr[openingBracket.index], arr[openingBracket.index].length, '\\right.\\hspace{-0\\.12em}')
		arr[openingBracket.index] = insertAtIndex(arr[openingBracket.index], openingBracket.char, '\\left')
	}
	return arr
}