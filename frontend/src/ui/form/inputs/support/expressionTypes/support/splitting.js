import { firstOf } from 'step-wise/util/arrays'

import { removeCursor } from '../../Input'
import { zoomIn, getDataStartCursor } from '../'

// splitToLeft takes an element data object and splits it at the cursor position. It returns an expression representing the resulting split.
export function splitToLeft(data) {
	const { value } = data
	const split = splitAtCursor(zoomIn(data))

	// Set up the new parameter.
	const newParameter = {
		type: 'Expression',
		value: split.right, // Keep the right part of the parameter.
	}

	// Set up the new element.
	const newElement = {
		...removeCursor(data),
		value: [
			newParameter,
			...value.slice(1),
		],
	}

	// Set up an expression for the final split result.
	return {
		type: 'Expression',
		value: [
			...split.left, // Put the left part of the parameter outside of the element.
			newElement,
		],
		cursor: {
			part: split.left.length,
			cursor: getDataStartCursor(newElement),
		},
	}
}

// splitToRight is identical to splitToLeft, but then the split is performed to the right.
export function splitToRight(data) {
	const { value } = data
	const split = splitAtCursor(zoomIn(data))

	// Set up the new parameter.
	const newParameter = {
		type: 'Expression',
		value: split.left, // Keep the left part of the parameter.
	}

	// Set up the new element.
	const newElement = {
		...removeCursor(data),
		value: [
			...value.slice(0, -1),
			newParameter,
		],
	}

	// Set up an expression for the final split result.
	return {
		type: 'Expression',
		value: [
			newElement,
			...split.right, // Put the right part of the parameter outside of the element.
		],
		cursor: {
			part: 1,
			cursor: getDataStartCursor(firstOf(split.right)),
		},
	}
}

// splitAtCursor takes an expression with a cursor in an expression part and splits it up into two expressions. It returns an object { left: ..., right ... } where each parameter is an expression value (so an array).
export function splitAtCursor(data) {
	const { value, cursor } = data
	const activeElementData = zoomIn(data)
	if (activeElementData.type !== 'ExpressionPart')
		throw new Error(`Invalid splitAtCursor call: tried to split an expression up along the cursor, but this was not possible. The cursor was not in a directly descending ExpressionPart.`)

	return {
		left: [
			...value.slice(0, cursor.part),
			{
				...removeCursor(activeElementData),
				value: activeElementData.value.substring(0, activeElementData.cursor),
			},
		],
		right: [
			{
				...removeCursor(activeElementData),
				value: activeElementData.value.substring(activeElementData.cursor),
			},
			...value.slice(cursor.part + 1),
		],
	}
}