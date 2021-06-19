// This is the template for functions like sqrt(...) which have a parameter after their term and have no other parameters.

import { arraySplice, firstOf } from 'step-wise/util/arrays'

import { removeCursor } from '../../../Input'

import { zoomIn, getDataStartCursor, getDataEndCursor } from '../../'
import * as Expression from '../../Expression'

import defaultFunctions from './'

const allFunctions = {
	...defaultFunctions,
	create,
	canMerge,
	merge,
	canSplit,
	split,
	removeElement,
}
export default allFunctions

function create(expressionData, part, position, name, alias) {
	const { value } = expressionData

	// Define cursors.
	const start = Expression.getStartCursor(value)
	const leftSide = { part, cursor: position }
	const rightSide = { part, cursor: position + alias.length }
	const endOfTerm = Expression.findEndOfTerm({ ...expressionData, cursor: rightSide }, true, false, 1)
	const end = Expression.getEndCursor(value)

	// Check if we had a bracket at the end of the term.
	let endOfTermWithoutBracket = endOfTerm
	if (endOfTerm.cursor > 0 && value[endOfTerm.part].value[endOfTerm.cursor - 1] === ')')
		endOfTermWithoutBracket = { ...endOfTerm, cursor: endOfTerm.cursor - 1 }

	// Set up the new function element. 
	const parameter = {
		type: 'Expression',
		value: Expression.getSubExpression(value, rightSide, endOfTermWithoutBracket),
	}
	const functionElement = {
		type: 'Function',
		name,
		alias,
		value: [parameter],
	}

	// Build the new Expression around it.
	const newValue = [
		...Expression.getSubExpression(value, start, leftSide),
		functionElement,
		...Expression.getSubExpression(value, endOfTerm, end),
	]
	const newCursor = { part: part + 1, cursor: getDataStartCursor(functionElement) }
	return {
		...expressionData,
		value: newValue,
		cursor: newCursor,
	}
}

function canMerge(data, mergeWithNext, fromOutside) {
	return true
}

function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	const element = expressionValue[partIndex]
	const parameter = element.value[0]

	// Check if we want to merge with what came before. This is the sign that we actually should delete this element.
	if (!mergeWithNext)
		return removeElement(expressionValue, partIndex, !fromOutside)

	// Merge with the right. First get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind } = Expression.getMergeParts(expressionValue, partIndex, mergeWithNext, true)

	// Set up the new parameter.
	const newParameter = {
		...parameter,
		value: [
			...parameter.value, // Take what was already there.
			...toPullIn, // Add what needs to be pulled in.
		],
		cursor: getDataEndCursor(parameter), // Put the cursor at the end of the previous parameter.
	}

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex), // Keep previous elements.
			{ // Extend the function.
				...element,
				value: [removeCursor(newParameter)],
			},
			...toLeaveBehind, // Keep what is left behind in the Expression.
		],
		cursor: {
			part: partIndex,
			cursor: {
				part: 0,
				cursor: newParameter.cursor, // Use the cursor of the new parameter.
			},
		},
	}
}

function canSplit(data) {
	return true
}

function split(data) {
	const split = Expression.splitAtCursor(zoomIn(data))

	// Set up the new parameter.
	const newParameter = Expression.cleanUp({
		type: 'Expression',
		value: split.left, // Keep the left part of the parameter.
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
			newFunction,
			...split.right, // Put the right part of the parameter outside of the function.
		],
		cursor: {
			part: 1,
			cursor: getDataStartCursor(firstOf(split.right)),
		},
	}
}

function removeElement(expressionValue, partIndex, withBackspace) {
	const element = expressionValue[partIndex]
	const { alias, value } = element
	const [parameter] = value

	// Add the remainder of the alias around the parameter.
	const leftInsertion = {
		type: 'ExpressionPart',
		value: withBackspace ? alias.slice(0, -1) : alias.slice(1),
	}
	const rightInsertion = {
		type: 'ExpressionPart',
		value: ')',
	}

	// Set up the new value and new cursor.
	const newValue = arraySplice(expressionValue, partIndex, 1, leftInsertion, parameter, rightInsertion)
	const newCursor = {
		part: partIndex,
		cursor: (withBackspace ? getDataEndCursor : getDataStartCursor)(leftInsertion),
	}

	// Assemble the resulting expression.
	return {
		type: 'Expression',
		value: newValue,
		cursor: newCursor,
	}
}