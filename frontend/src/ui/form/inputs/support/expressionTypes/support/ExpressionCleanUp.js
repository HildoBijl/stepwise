import { lastOf } from 'step-wise/util/arrays'
import { getEmpty } from 'step-wise/inputTypes/Expression'
import { isFunctionAllowed } from 'step-wise/inputTypes/Expression/interpreter/expression'

import { removeCursor } from '../../Input'
import { getFuncs, zoomIn, zoomInAt } from '../index.js'
import { getStartCursor } from '../Expression'
import ExpressionPart from '../ExpressionPart'
import { functions } from '../Function'
import { accents } from '../Accent'

export default function cleanUp(data, settings) {
	const hasCursor = !!data.cursor

	// Step 1 is to clean up all the elements individually.
	data = cleanUpElements(data, settings)

	// Step 2 is to flatten all expressions inside of the expression array.
	data = flattenExpressionArray(data)

	// Step 3 is to remove all unnecessary elements.
	data = removeUnnecessaryElements(data)

	// Step 4 is to ensure that the expression consists of alternating ExpressionParts (even indices) and alternating other parts (odd indices).
	data = alternateExpressionParts(data, settings)

	// Step 5 is to auto-replace functions. The auto-replace on ExpressionPart level for symbols (Greek alphabet, plus-minus, ...) was already done by cleaning them (and running an extra cleaning upon merging) but this concerns expression-wide auto-replace like functions (root, log, ...) and accents (dot, hat, ...).
	data = applyAutoReplace(data, settings)

	// Return the result with or without a cursor.
	return hasCursor ? data : removeCursor(data)
}

// cleanUpElements will take an expression data object and walk through all children, calling the cleanUp function for them. It adjusts the cursor along when needed.
function cleanUpElements(data, settings) {
	const { value, cursor } = data
	let newCursor = null
	const newValue = value.map((_, part) => {
		const newElementUncleaned = zoomInAt(data, part)
		const cleanUp = getFuncs(newElementUncleaned).cleanUp
		const newElement = cleanUp ? cleanUp(newElementUncleaned, settings) : newElementUncleaned
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
	const filteredValue = value.filter((element, index) => { // Remove pointless object.
		if (cursor && cursor.part === index)
			return true // The cursor is in here. Keep it.
		const funcs = getFuncs(element)
		if (!funcs.shouldRemove)
			return true // No removal function specified. Keep it.
		return !funcs.shouldRemove(element) // Let the object decide.
	})
	return {
		...data,
		value: filteredValue,
		cursor: cursor && {
			...cursor,
			part: filteredValue.indexOf(activeElement),
		},
	}
}

function alternateExpressionParts(data, settings) {
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
			}, settings)
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

function applyAutoReplace(data, settings) {
	// Check if the cursor is in an expression part. If not, don't apply auto-replace.
	const { cursor } = data
	if (!cursor)
		return data
	const activeElementData = zoomIn(data)
	if (activeElementData.type !== 'ExpressionPart')
		return data
	const expressionPartValue = activeElementData.value

	// Set up a handler to apply auto-replace with.
	const checkAutoReplaceFor = (name, funcs) => {
		const { aliases, create } = funcs
		aliases.forEach(alias => {
			const toSearch = `${alias}`
			const position = expressionPartValue.indexOf(toSearch)
			if (position !== -1)
				data = create(data, cursor.part, position, name, alias)
		})
	}

	// Walk through the expression part to search for the respective functions. If they're found, create the respective function.
	Object.keys(functions).forEach(name => isFunctionAllowed(name, settings) && checkAutoReplaceFor(name, functions[name]))
	Object.keys(accents).forEach(name => settings.accent && checkAutoReplaceFor(name, accents[name]))

	return data
}