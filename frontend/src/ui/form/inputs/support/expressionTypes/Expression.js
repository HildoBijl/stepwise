import { insertAtIndex } from 'step-wise/util/strings'
import { firstOf, lastOf, sum } from 'step-wise/util/arrays'
import { isEmpty, getEmpty } from 'step-wise/inputTypes/Expression'

import { addCursor, removeCursor } from '../Input'
import { getClosestElement } from '../MathWithCursor'
import { getFuncs, zoomIn, getDataStartCursor, getDataEndCursor, isCursorAtDataStart, isCursorAtDataEnd, dataAcceptsKey } from './index.js'
import ExpressionPart from './ExpressionPart'

import cleanUp from './support/ExpressionCleanUp'
import { getKeyPressHandlers } from './support/ExpressionSupport'
import { isCursorKey } from './support/acceptsKey'

const allFunctions = {
	toLatex,
	getCursorProperties,
	acceptsKey,
	keyPressToData,
	canMoveCursorVertically,
	charElementClickToCursor,
	coordinatesToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	getEmpty,
	isEmpty,
	countNetBrackets,
	canSplit,
	cleanUp,
}
export default allFunctions

export function toLatex(data) {
	let { value } = data

	// Get the Latex of each individual element. For this, assemble the options properly.
	const latexAndCharsPerElement = value.map((element, index) => {
		const nextElement = value[index + 1]

		// Check if we have a set-up like f_1(x): a SubSup followed by a bracket.
		let beforeSubSupWithBrackets = false
		if (element.type === 'ExpressionPart' && nextElement && nextElement.type === 'SubSup' && value[index + 2].value[0] === '(') {
			// The superscript must also be empty or be "-1" for an inverse.
			const sup = nextElement.value.sup
			if (!sup || getFuncs(sup).isEmpty(sup) || (sup.value.length === 1 && sup.value[0].value === '-1'))
				beforeSubSupWithBrackets = true
		}

		// Make the call with the right options.
		return getFuncs(element).toLatex(element, { index, beforeSubSupWithBrackets })
	})

	// We now have an array with latex and chars mixed. Let's extract the latex and the chars.
	const latexPerElement = latexAndCharsPerElement.map(elementLatexAndChars => elementLatexAndChars.latex)
	const chars = latexAndCharsPerElement.map(elementLatexAndChars => elementLatexAndChars.chars)

	// Arrange the brackets. Do this before joining the array because using indices we can still find which elements are ExpressionParts: the odd indices.
	let latex = processExpressionPartBrackets(latexPerElement).join('')

	// If there are certain signs at the start or end, add spacing. This is to prevent inconsistent Latex spacing when you for instance type "a+" and then type "b" after. Without this, the plus sign jumps.
	const start = ['+', '\\cdot '].find(char => latex.startsWith(char))
	if (start)
		latex = insertAtIndex(latex, start.length, '\\: ')
	const end = ['+', '\\cdot ', '-'].find(char => latex.endsWith(char))
	if (end)
		latex = insertAtIndex(latex, latex.length - end.length, '\\: ')

	// If the string starts or ends with \! (negative space) then remove it. This is to prevent the Expression from having no margin and cursors potentially disappearing. An expeption occurs when we're empty: then we want to have no space at all.
	if (!isEmpty(value)) {
		if (latex.substring(0, 2) === '\\!')
			latex = latex.slice(2)
		if (latex.substr(-2) === '\\!')
			latex = latex.slice(0, -2)
	}

	// All done.
	return { latex, chars }
}

export function getCursorProperties(data, charElements, container) {
	const activeElement = zoomIn(data)
	return getFuncs(activeElement).getCursorProperties(activeElement, charElements[data.cursor.part], container)
}

export function acceptsKey(keyInfo, data) {
	const { key, ctrl, alt } = keyInfo
	const { cursor, value } = data
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return false

	// Check for cursor keys.
	if (isCursorKey(keyInfo, data))
		return true

	// Check for the spacebar.
	if (key === ' ' || key === 'Spacebar') {
		if (activeElementFuncs.canSplit && activeElementFuncs.canSplit(activeElementData)) {
			const parameter = zoomIn(activeElementData)
			const parameterFuncs = getFuncs(parameter)
			if (!(parameterFuncs.canSplit && parameterFuncs.canSplit(parameter))) {
				if (zoomIn(parameter).type === 'ExpressionPart') {
					return true
				}
			}
		}
	}

	// Check for inavlid keys inside accents that are shifted to the neighbouring element.
	if (activeElementData.type === 'Accent') {
		if (!dataAcceptsKey(keyInfo, activeElementData)) {
			if (isCursorAtDataStart(activeElementData) && dataAcceptsKey(keyInfo, value[cursor.part - 1]))
				return true
			if (isCursorAtDataEnd(activeElementData) && dataAcceptsKey(keyInfo, value[cursor.part + 1]))
				return true
		}
	}

	// Check the child element.
	return dataAcceptsKey(keyInfo, zoomIn(data))
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = data
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	// Verify the key.
	if (!acceptsKey(keyInfo, data))
		return data

	const { passOn, moveLeft, moveRight } = getKeyPressHandlers(keyInfo, data, charElements, topParentData, contentsElement, cursorElement)

	// For left/right-arrows, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part > 0 && (isCursorAtDataStart(activeElementData) || (activeElementFuncs.canMoveCursorOutside && activeElementFuncs.canMoveCursorOutside(activeElementData, false))))
		return moveLeft()
	if (key === 'ArrowRight' && cursor.part < value.length - 1 && (isCursorAtDataEnd(activeElementData) || (activeElementFuncs.canMoveCursorOutside && activeElementFuncs.canMoveCursorOutside(activeElementData, true))))
		return moveRight()

	// For the home/end, move to the start/end of this expression, but only if the cursor is already at the start of said element or a child of said element. (If not, pass the call on to let the part itself handle it.)
	if (key === 'Home') {
		if (activeElementData.type === 'ExpressionPart' || activeElementData.type === 'Accent' || isCursorAtDataStart(activeElementData) || isCursorAtDataStart(zoomIn(activeElementData)))
			return { ...data, cursor: getStartCursor(value) }
	}
	if (key === 'End') {
		if (activeElementData.type === 'ExpressionPart' || activeElementData.type === 'Accent' || isCursorAtDataEnd(activeElementData) || isCursorAtDataEnd(zoomIn(activeElementData)))
			return { ...data, cursor: getEndCursor(value) }
	}

	// When the cursor is at the start of an element and a backspace is pressed, merge elements appropriately.
	if (key === 'Backspace' && isCursorAtDataStart(activeElementData)) {
		if (isCursorAtDataStart(data))
			return data // Cannot remove anything.

		// Are we in an expression part?
		if (activeElementData.type === 'ExpressionPart') {
			const previousPart = value[cursor.part - 1]
			const previousPartFuncs = getFuncs(previousPart)
			if (previousPartFuncs.canMerge && previousPartFuncs.canMerge(previousPart, true, true))
				return previousPartFuncs.merge(value, cursor.part - 1, true, true)
			else
				return moveLeft()
		} else { // We are in a special element.
			const activePart = value[cursor.part]
			const activePartFuncs = getFuncs(activePart)
			if (activePartFuncs.canMerge && activePartFuncs.canMerge(activePart, false, false))
				return activePartFuncs.merge(value, cursor.part, false, false)
			else
				return moveLeft()
		}
	}

	// When the cursor is at the end of an element and a delete is pressed, merge elements appropriately.
	if (key === 'Delete' && isCursorAtDataEnd(activeElementData)) {
		if (isCursorAtDataEnd(data))
			return data // Cannot delete anything.

		// Are we in an expression part?
		if (activeElementData.type === 'ExpressionPart') {
			const nextPart = value[cursor.part + 1]
			const nextPartFuncs = getFuncs(nextPart)
			if (nextPartFuncs.canMerge && nextPartFuncs.canMerge(nextPart, false, true))
				return nextPartFuncs.merge(value, cursor.part + 1, false, true)
			else
				return moveRight()
		} else { // We are in a special element.
			const activePart = value[cursor.part]
			const activePartFuncs = getFuncs(activePart)
			if (activePartFuncs.canMerge && activePartFuncs.canMerge(activePart, true, false))
				return activePartFuncs.merge(value, cursor.part, true, false)
			else
				return moveRight()
		}
	}

	// When the spacebar is pressed, try to split up the element. Only do this when the active element indicates its child can be split, the said child (parameter) cannot be split itself, and the cursor is in an ExpressionPart of said child.
	if (key === ' ' || key === 'Spacebar') {
		if (activeElementFuncs.canSplit && activeElementFuncs.canSplit(activeElementData)) {
			const parameter = zoomIn(activeElementData)
			const parameterFuncs = getFuncs(parameter)
			if (!(parameterFuncs.canSplit && parameterFuncs.canSplit(parameter))) {
				if (zoomIn(parameter).type === 'ExpressionPart') {
					const split = activeElementFuncs.split(activeElementData)
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
		}
	}

	// Check if the cursor is at the start/end of an accent that doesn't accept the key, while the ExpressionPart neighbour does accept the key. In that case, move the cursor first to the ExpressionPart and process appropriately.
	if (activeElementData.type === 'Accent') {
		if (!dataAcceptsKey(keyInfo, activeElementData)) {
			// Check if we're near the previous part and if that accepts it.
			const previousPart = value[cursor.part - 1]
			if (isCursorAtDataStart(activeElementData) && dataAcceptsKey(keyInfo, previousPart)) {
				const newExpression = {
					...data,
					cursor: {
						part: cursor.part - 1,
						cursor: getDataEndCursor(previousPart),
					},
				}
				return keyPressToData(keyInfo, newExpression, charElements, newExpression, contentsElement, cursorElement)
			}

			// Check if we're near the next part and if that accepts it.
			const nextPart = value[cursor.part + 1]
			if (isCursorAtDataEnd(activeElementData) && dataAcceptsKey(keyInfo, nextPart)) {
				const newExpression = {
					...data,
					cursor: {
						part: cursor.part + 1,
						cursor: getDataStartCursor(nextPart),
					},
				}
				return keyPressToData(keyInfo, newExpression, charElements, newExpression, contentsElement, cursorElement)
			}
		}
	}

	// Pass on to the appropriate child element.
	return passOn()
}

export function canMoveCursorVertically(data, up) {
	const activeElementData = zoomIn(data)
	const canMoveCursorVertically = getFuncs(activeElementData).canMoveCursorVertically
	return canMoveCursorVertically ? canMoveCursorVertically(activeElementData, up) : false
}

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const { value } = data
	const part = firstOf(trace)
	const newCursor = getFuncs(value[part]).charElementClickToCursor(evt, value[part], trace.slice(1), charElements[part], equationElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const part = getClosestElement(coordinates, boundsData)
	const element = data.value[part]
	return {
		part,
		cursor: getFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[part], element, charElements[part], contentsElement)
	}
}

export function getStartCursor(value = getEmpty()) {
	return { part: 0, cursor: getDataStartCursor(firstOf(value)) }
}

export function getEndCursor(value = getEmpty()) {
	return { part: value.length - 1, cursor: getDataEndCursor(lastOf(value)) }
}

export function isCursorAtStart(value, cursor) {
	return cursor.part === 0 && isCursorAtDataStart(addCursor(firstOf(value), cursor.cursor))
}

export function isCursorAtEnd(value, cursor) {
	return cursor.part === value.length - 1 && isCursorAtDataEnd(addCursor(lastOf(value), cursor.cursor))
}

export { getEmpty, isEmpty, cleanUp }

// countNetBrackets counts the net number of opening minus closing brackets in a certain part of the expression. If relativeToCursor is 0, it's for the full expression. For -1 it's prior to the cursor and for 1 it's after the cursor. When the cursor is used, we assume it's in an ExpressionPart element.
export function countNetBrackets(data, relativeToCursor = 0) {
	const { value, cursor } = data

	// When we don't care about the cursor, we just sum everything up.
	if (relativeToCursor === 0) {
		return sum(value.map(element => {
			const funcs = getFuncs(element)
			const countNetBrackets = funcs.countNetBrackets
			return countNetBrackets ? countNetBrackets(element, relativeToCursor) : 0
		}))
	}

	// We care about the cursor. Check that the cursor is in an ExpressionPart element.
	if (value[cursor.part].type !== 'ExpressionPart')
		throw new Error(`Invalid equation function call: called countNetBrackets for an Expression while the cursor was not in an ExpressionPart of that expression.`)

	// Find the right range and add up for that range, also taking into account the element itself.
	const arrayPart = (relativeToCursor === -1 ? value.slice(0, cursor.part) : value.slice(cursor.part + 1))
	const netBracketsInPreviousParts = sum(arrayPart.map(element => {
		const countNetBrackets = getFuncs(element).countNetBrackets
		return countNetBrackets ? countNetBrackets(element, 0) : 0
	}))
	const netBracketsInCurrentPart = ExpressionPart.countNetBrackets(zoomIn(data), relativeToCursor)
	return netBracketsInPreviousParts + netBracketsInCurrentPart
}

// processExpressionPartBrackets takes an array of Latex-strings and matches the brackets inside all strings. It does this only for the even-numbered elements, which are the ExpressionParts.
function processExpressionPartBrackets(arr) {
	// Walk through the ExpressionParts, one by one and inside. Memorize opening brackets. Whenever we encounter a closing bracket, match it to the previous opening backet.
	let openingBrackets = []
	arr.forEach((_, index) => {
		// For non-expression-parts, check if they end with a bracket. If so, remember this. For the rest, keep them as is.
		if (index % 2 === 1) {
			const latex = arr[index]
			const lastCharIndex = latex.length - 1
			if (latex[lastCharIndex] === '(')
				openingBrackets.push({ index, char: lastCharIndex })
			return
		}

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
					const addLeft = '\\left.\\hspace{-0.12em}' // Add negative space to prevent the \. from distorting the layout.
					arr[index] = insertAtIndex(arr[index], char, addRight) // Close off the bracket.
					arr[index] = insertAtIndex(arr[index], 0, addLeft)
					char += addLeft.length + addRight.length // These characters were added. To prevent an infinite loop, add this length to the char iterator.
				}
			}
		}
	})

	// Close off remaining opening brackets by adding \right. on the end of the respective strings.
	while (openingBrackets.length > 0) {
		const openingBracket = openingBrackets.pop()
		arr[openingBracket.index] = insertAtIndex(arr[openingBracket.index], arr[openingBracket.index].length, '\\right.\\hspace{-0.12em}')
		arr[openingBracket.index] = insertAtIndex(arr[openingBracket.index], openingBracket.char, '\\left')
	}
	return arr
}

// canSplit asks the child element whether it can split.
export function canSplit(data) {
	const activeElementData = zoomIn(data)
	const canSplit = getFuncs(activeElementData).canSplit
	return canSplit && canSplit(activeElementData)
}
