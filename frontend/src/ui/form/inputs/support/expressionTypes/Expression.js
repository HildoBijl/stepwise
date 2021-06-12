import { insertAtIndex } from 'step-wise/util/strings'
import { firstOf, lastOf, arraySplice, sum } from 'step-wise/util/arrays'
import { repeatWithIndices } from 'step-wise/util/functions'
import { isEmpty, getEmpty } from 'step-wise/inputTypes/Expression'

import { addCursor, removeCursor } from '../Input'
import { getClosestElement } from '../MathWithCursor'
import * as General from './index.js'
import * as ExpressionPart from './ExpressionPart'
import * as SubSup from './SubSup'

export function toLatex(value) {
	// Get the Latex of each individual element. For this, assemble the options properly.
	const latexPerElement = value.map((element, index) => {
		const nextElement = value[index + 1]

		// Check if we have a set-up like f_1(x): a SubSup followed by a bracket.
		let beforeSubSupWithBrackets = false
		if (element.type === 'ExpressionPart' && nextElement && nextElement.type === 'SubSup' && value[index + 2].value[0] === '(') {
			// The superscript must also be empty or be "-1" for an inverse.
			const sup = nextElement.value.sup
			if (!sup || General.isEmpty(sup) || (sup.value.length === 1 && sup.value[0].value === '-1'))
				beforeSubSupWithBrackets = true
		}

		// Make the call with the right options.
		return General.toLatex(element, { index, beforeSubSupWithBrackets })
	})

	// Arrange the brackets.
	let latex = processExpressionPartBrackets(latexPerElement).join('')

	// If there are certain signs at the start or end, add spacing. This is to prevent inconsistent Latex spacing when you for instance type "a+" and then type "b" after. Without this, the plus sign jumps.
	const start = ['+', '\\cdot '].find(char => latex.startsWith(char))
	if (start)
		latex = insertAtIndex(latex, start.length, '\\: ')
	const end = ['+', '\\cdot ', '-'].find(char => latex.endsWith(char))
	if (end)
		latex = insertAtIndex(latex, latex.length - end.length, '\\: ')

	// All done.
	return latex
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

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const activeElementData = General.zoomIn(data)

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, activeElementData, charElements[cursor.part], topParentData, contentsElement, cursorElement)
		return {
			...data,
			value: arraySplice(value, cursor.part, 1, removeCursor(adjustedElement)),
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		}
	}

	// Set up other handlers.
	const moveLeft = () => {
		const part = cursor.part - 1
		return { ...data, cursor: { part, cursor: General.getEndCursor(value[part]) } } // Move to the end of the previous element.
	}
	const moveRight = () => {
		const part = cursor.part + 1
		return { ...data, cursor: { part, cursor: General.getStartCursor(value[part]) } } // Move to the start of the next element.
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part > 0 && General.isCursorAtStart(activeElementData))
		return moveLeft()
	if (key === 'ArrowRight' && cursor.part < value.length - 1 && General.isCursorAtEnd(activeElementData))
		return moveRight()

	// For the home/end, move to the start/end of this expression. If the cursor is inside a special part, and inside the child elements not yet at the corresponding edge, pass the call on.
	if (key === 'Home' && (activeElementData.type === 'ExpressionPart' || General.isCursorAtStart(activeElementData) || General.isCursorAtStart(General.zoomIn(activeElementData))))
		return { ...data, cursor: getStartCursor(value) }
	if (key === 'End' && (activeElementData.type === 'ExpressionPart' || General.isCursorAtEnd(activeElementData) || General.isCursorAtEnd(General.zoomIn(activeElementData))))
		return { ...data, cursor: getEndCursor(value) }

	// On divisions create a fraction.
	if (key === '/' || key === 'Divide') {
		// If the cursor is in a special part (not a string) then pass it on.
		if (value[cursor.part].type !== 'ExpressionPart')
			return passOn()

		// We must create a fraction! First find what needs to be put in the fraction: find the cursor endings.
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
		const newCursor = { part: newValue.indexOf(fraction), cursor: { part: 'den', cursor: General.getStartCursor(fraction.value.den) } }
		return {
			...data,
			value: newValue,
			cursor: newCursor,
		}
	}

	// When the cursor is at the start of an element and a backspace is pressed, merge elements appropriately.
	if (key === 'Backspace' && General.isCursorAtStart(activeElementData)) {
		if (isCursorAtStart(value, cursor))
			return data // Cannot remove anything.

		// Are we in an expression part?
		if (activeElementData.type === 'ExpressionPart') {
			const previousPart = value[cursor.part - 1]
			if (General.canMerge(previousPart, true, true))
				return General.merge(value, cursor.part - 1, true, true)
			else
				return moveLeft()
		} else { // We are in a special element.
			const activePart = value[cursor.part]
			if (General.canMerge(activePart, false, false))
				return General.merge(value, cursor.part, false, false)
			else
				return moveLeft()
		}
	}

	// When the cursor is at the end of an element and a delete is pressed, merge elements appropriately.
	if (key === 'Delete' && General.isCursorAtEnd(activeElementData)) {
		if (isCursorAtEnd(value, cursor))
			return data // Cannot delete anything.

		// Are we in an expression part?
		if (activeElementData.type === 'ExpressionPart') {
			const nextPart = value[cursor.part + 1]
			if (General.canMerge(nextPart, false, true))
				return General.merge(value, cursor.part + 1, false, true)
			else
				return moveRight()
		} else { // We are in a special element.
			const activePart = value[cursor.part]
			if (General.canMerge(activePart, true, false))
				return General.merge(value, cursor.part, true, false)
			else
				return moveRight()
		}
	}

	// When the spacebar is pressed, try to split up the element. Only do this when the child element is the last element in the chain that can be split up. Otherwise pass it on to split the child up.
	if (key === ' ' || key === 'Spacebar') {
		const zoom = General.zoomIn(data)
		if (General.canSplit(zoom) && !General.canSplit(General.zoomIn(zoom))) {
			const split = General.split(zoom)
			return {
				...data,
				value: [
					...value.slice(0, cursor.part),
					removeCursor(split),
					...value.slice(cursor.part + 1),
				],
				cursor: {
					part: cursor.part,
					cursor: split.cursor,
				},
			}
		}
	}

	// When an underscore or power symbol is pressed, while in an ExpressionPart, create a subsup.
	if (key === '_' || key === 'Underscore' || key === '^' || key === 'Power') {
		if (activeElementData.type === 'ExpressionPart') {
			const sub = (key === '_' || key === 'Underscore') // Cursor in the sub or the sup?
			const subSupPart = sub ? 'sub' : 'sup'

			// Set up a handler for determining the cursor.
			const moveCursorToSubSup = (toRight) => {
				const part = cursor.part + (toRight ? 1 : -1)

				// If the subSup doesn't have the part where the cursor should be in, make it first.
				let subSup = value[part], newValue = value
				if (!subSup.value[subSupPart]) {
					subSup = { ...subSup, value: { ...subSup.value, [subSupPart]: SubSup[`getEmpty${sub ? 'Sub' : 'Sup'}`]() } }
					newValue = arraySplice(value, part, 1, subSup)
				}

				// Set up the result.
				return {
					...data,
					value: newValue,
					cursor: {
						part, // In the subSup.
						cursor: {
							part: subSupPart,
							cursor: General[`get${toRight ? 'Start' : 'End'}Cursor`](subSup.value[subSupPart]),
						},
					},
				}
			}

			// Check if we are after or prior to a SubSup. In that case, only move the cursor.
			const previousElementData = value[cursor.part - 1]
			if (General.isCursorAtStart(activeElementData) && previousElementData && previousElementData.type === 'SubSup')
				return moveCursorToSubSup(false)
			const nextElementData = value[cursor.part + 1]
			if (General.isCursorAtEnd(activeElementData) && nextElementData && nextElementData.type === 'SubSup')
				return moveCursorToSubSup(true)

			// Split the current ExpressionPart and put an empty SubSup in-between.
			const split = splitAtCursor(data)
			const newSubSup = {
				type: 'SubSup',
				value: SubSup.getEmpty(sub === true, sub === false),
			}
			return {
				...data,
				value: [
					...split.left,
					newSubSup,
					...split.right,
				],
				cursor: {
					part: cursor.part + 1,
					cursor: {
						part: subSupPart,
						cursor: General.getStartCursor(newSubSup.value[subSupPart]),
					},
				},
			}
		}
	}

	// Pass on to the appropriate child element.
	return passOn()
}

export function canMoveCursorVertically(data, up) {
	return General.canMoveCursorVertically(General.zoomIn(data), up)
}

export function charElementClickToCursor(evt, value, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const traceClone = [...trace]
	const part = traceClone.shift()
	return {
		part,
		cursor: General.charElementClickToCursor(evt, value[part], traceClone, charElements[part], equationElement),
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const part = getClosestElement(coordinates, boundsData)
	return {
		part,
		cursor: General.coordinatesToCursor(coordinates, boundsData.parts[part], data.value[part], charElements[part], contentsElement)
	}
}

// findEndOfTerm searches for the end of a term. When you have an expression like a*(b+c/d+e)sin(2x)+3, and you put a "/" sign right before "sin", then we need to know which parts need to go in the fraction. We can go right (toRight = true) and left (toRight = false) and find the cursor positions of the respective endings of the terms. Basically, the term ends whenever we encounter a +, - or * and we are not still within brackets.
export function findEndOfTerm(data, toRight = true, skipFirst = false) {
	const { value, cursor } = data

	// Define iterators: parameters that will change as we go.
	let { part: partIterator, cursor: cursorIterator } = cursor
	let bracketCount = 0

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
	if (skipFirst && hasNextSymbol())
		shiftCursor()
	while (hasNextSymbol()) {
		const nextSymbol = getNextSymbol()

		// On a breaking character, return the current cursor position. 
		if (bracketCount === 0 && ['+', '-', '*'].includes(nextSymbol))
			return { part: partIterator, cursor: cursorIterator }

		// On a bracket, adjust the bracket count. If it drops below zero, return the current cursor position too.
		if (nextSymbol === '(')
			bracketCount += toRight ? 1 : -1
		else if (nextSymbol === ')')
			bracketCount += toRight ? -1 : 1
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

	// All done!
	return newValue
}

// getMergeParts takes an expression value and an index to a specific part. It then walks from this part outwards until it finds a break character (like a plus, minus or times symbol). It returns an object { toPullIn: [...], toLeaveBehind: [...], ... various cursors ... } with the expression parts to pull in and to leave behind in the given direction.
export function getMergeParts(expressionValue, partIndex, toRight, skipFirst) {
	// Find the cursor positions where we need to split things.
	const edgeElementIndex = partIndex + (toRight ? 1 : -1)
	const cursorAtEdgeOfElement = {
		part: edgeElementIndex,
		cursor: General[`get${toRight ? 'Start' : 'End'}Cursor`](expressionValue[edgeElementIndex]),
	}
	const dummyExpression = {
		type: 'Expression',
		value: expressionValue,
		cursor: cursorAtEdgeOfElement,
	}
	const cursorAtBreak = findEndOfTerm(dummyExpression, toRight, skipFirst)
	const cursorAtEnd = toRight ? getEndCursor(expressionValue) : getStartCursor(expressionValue)

	// Apply the proper split.
	const toPullIn = toRight ?
		getSubExpression(expressionValue, cursorAtEdgeOfElement, cursorAtBreak) :
		getSubExpression(expressionValue, cursorAtBreak, cursorAtEdgeOfElement)
	const toLeaveBehind = toRight ?
		getSubExpression(expressionValue, cursorAtBreak, cursorAtEnd) :
		getSubExpression(expressionValue, cursorAtEnd, cursorAtBreak)

	// Return the result, including cursors.
	return {
		toPullIn,
		toLeaveBehind,
		cursorAtEdgeOfElement,
		cursorAtBreak,
		cursorAtEnd,
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

export function shouldRemove() {
	return false
}

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
	const netBracketsInCurrentPart = ExpressionPart.countNetBrackets(General.zoomIn(data), relativeToCursor)
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

export function canMerge() {
	return false
}

export function canSplit(data) {
	return General.canSplit(General.zoomIn(data))
}

// splitAtCursor takes an expression with a cursor in an expression part and splits it up into two expressions. It returns an object { left: ..., right ... } where each parameter is an expression value (so an array).
export function splitAtCursor(data) {
	const { value, cursor } = data
	const activeElementData = General.zoomIn(data)
	if (activeElementData.type !== 'ExpressionPart')
		throw new Error(`Invalid splitAtCursor call: tried to split an expression up along the cursor, but this was not possible. The cursor was not in a directly descending ExpressionPart.`)

	return {
		left: [
			...value.slice(0, cursor.part),
			{
				...activeElementData,
				value: activeElementData.value.substring(0, activeElementData.cursor),
			},
		],
		right: [
			{
				...activeElementData,
				value: activeElementData.value.substring(activeElementData.cursor),
			},
			...value.slice(cursor.part + 1),
		],
	}
}

export function cleanUp(data) {
	const hasCursor = !!data.cursor

	// Step 1 is to clean up all the elements individually.
	data = cleanUpElements(data)

	// Step 2 is to flatten all expressions inside of the expression array.
	data = flattenExpressionArray(data)

	// Step 3 is to remove all unnecessary elements.
	data = removeUnnecessaryElements(data)

	// Step 4 is to ensure that the expression consists of alternating ExpressionParts (even indices) and alternating other parts (odd indices).
	data = alternateExpressionParts(data)

	// Step 5 is to auto-replace functions. The auto-replace on ExpressionPart level (Greek symbols) was already done by cleaning them (and running an extra cleaning upon merging) but this concerns expression-wide auto-replace.
	data = applyAutoReplace(data)

	// Return the result with or without a cursor.
	return hasCursor ? data : removeCursor(data)
}

// cleanUpElements will take an expression data object and walk through all children, calling the cleanUp function for them. It adjusts the cursor along when needed.
function cleanUpElements(data) {
	const { value, cursor } = data
	let newCursor = null
	const newValue = value.map((_, part) => {
		const newElement = General.cleanUp(General.zoomInAt(data, part))
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: newElement.cursor }
		return removeCursor(newElement)
	})
	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
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

function removeUnnecessaryElements(data) {
	const { value, cursor } = data
	const activeElement = cursor && value[cursor.part]
	const filteredValue = value.filter((element, index) => !General.shouldRemove(element) || (cursor && cursor.part === index)) // Remove all elements that say they should be removed. (Unless there's a cursor in them.)
	return {
		...data,
		value: filteredValue,
		cursor: cursor && {
			...cursor,
			part: filteredValue.indexOf(activeElement),
		},
	}
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
			// Two ExpressionParts in a row. Merge them. And if the cursor is in this merged ExpressionPart, position it appropriately. Also run a clean-up, in case this merging creates auto-replace options.
			let jointCursor = null
			if (cursor && cursor.part === index)
				jointCursor = lastAddedElement.value.length + cursor.cursor
			if (newCursor && newCursor.part === newValue.length - 1)
				jointCursor = newCursor.cursor
			const newExpressionPart = ExpressionPart.cleanUp({
				...lastAddedElement,
				value: lastAddedElement.value + element.value,
				cursor: jointCursor,
			})
			if (jointCursor !== null)
				newCursor = { part: newValue.length - 1, cursor: newExpressionPart.cursor }
			newValue[newValue.length - 1] = removeCursor(newExpressionPart)
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

function applyAutoReplace(data) {
	// ToDo first: render normal functions with \rm.

	// ToDo: check for special functions and their aliases, and apply them too, with standard values.
	// ToDo: render an sqrt function. Get clicks working.
	// ToDo: render a log function. Get clicks working.
	return data
}