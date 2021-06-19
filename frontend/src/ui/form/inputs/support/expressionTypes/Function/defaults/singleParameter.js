// This is the template for functions like log[10](...) which have a parameter inside their expression and not a parameter after (which is contained in an ExpressionPart of the parent Expression.)

import { arraySplice } from 'step-wise/util/arrays'

import { removeCursor } from '../../../Input'

import { zoomIn, isCursorAtDataStart, getDataStartCursor } from '../../'
import * as Expression from '../../Expression'

import defaultFunctions from './'

const allFunctions = {
	...defaultFunctions,
	canMerge,
	merge,
	canSplit,
	split,
}
export default allFunctions

export function canMerge(data, mergeWithNext, fromOutside) {
	return true
}

export function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	const element = expressionValue[partIndex]
	const parameter = element.value[0]

	// Check if we want to mergeWithNext. This is the sign that we actually should delete this element.
	if (mergeWithNext)
		return removeElement(expressionValue, partIndex, fromOutside)

	// Merge with the left. First get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind, cursorAtBreak } = Expression.getMergeParts(expressionValue, partIndex, mergeWithNext, true)

	// If the expression to pull in is empty, and we came from inside, move the cursor outside.
	if (!fromOutside && Expression.isEmpty(toPullIn)) {
		return {
			type: 'Expression',
			value: expressionValue,
			cursor: cursorAtBreak,
		}
	}

	// Set up the new parameter.
	const newParameter = Expression.cleanUp({
		...parameter,
		value: [
			...toPullIn, // Add what needs to be pulled in.
			...parameter.value, // Take what was already there.
		],
		cursor: Expression.getEndCursor(toPullIn), // Put the cursor at the end of the pulled-in expression.
	})

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			...toLeaveBehind, // Keep what is left behind in the Expression.
			{ // Extend the function.
				...element,
				value: [removeCursor(newParameter)],
			},
			...expressionValue.slice(partIndex + 1), // Keep remaining elements.
		],
		cursor: {
			part: toLeaveBehind.length,
			cursor: {
				part: 0,
				cursor: newParameter.cursor, // Use the cursor of the new parameter.
			},
		},
	}
}

export function canSplit(data) {
	if (!data.cursor)
		return false
	return !isCursorAtDataStart(zoomIn(data))
}

export function split(data) {
	const split = Expression.splitAtCursor(zoomIn(data))

	// Set up the new parameter.
	const newParameter = Expression.cleanUp({
		type: 'Expression',
		value: split.right,
	})

	// Set up the new function.
	const newFunction = {
		...data,
		value: [newParameter],
	}

	// Set up an expression for the final split result.
	return {
		type: 'Expression',
		value: [
			...split.left,
			newFunction,
		],
		cursor: {
			part: split.left.length,
			cursor: getDataStartCursor(newFunction),
		},
	}
}

export function removeElement(expressionValue, partIndex, withBackspace) {
	const element = expressionValue[partIndex]
	const { alias } = element

	// Replace the element including the previous and next ExpressionParts with a merged ExpressionPart.
	const prevElement = expressionValue[partIndex - 1]
	const replacementText = withBackspace ? alias.slice(0, -1) : alias.slice(1)
	const nextElement = expressionValue[partIndex + 1]
	const replacement = {
		type: 'ExpressionPart',
		value: prevElement.value + replacementText + nextElement.value,
	}

	// Assemble the resulting expression and clean it up, merging ExpressionParts.
	return {
		type: 'Expression',
		value: arraySplice(expressionValue, partIndex - 1, 3, replacement),
		cursor: {
			part: partIndex - 1,
			cursor: prevElement.value.length + (withBackspace ? alias.length - 1 : 0),
		}
	}
}