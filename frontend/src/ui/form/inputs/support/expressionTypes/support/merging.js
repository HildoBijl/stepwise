import { firstOf, lastOf } from 'step-wise/util/arrays'
import { getSubExpression } from 'step-wise/inputTypes/Expression/interpreter/support'

import { getDataStartCursor, getDataEndCursor } from '../'
import Expression from '../Expression'
import { findEndOfTerm } from './ExpressionSupport'

export function mergeWithLeft(expressionValue, partIndex, fromOutside) {
	const element = expressionValue[partIndex]
	const parameter = firstOf(element.value)
	
	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind, cursorAtBreak } = getMergeParts(expressionValue, partIndex, false, true)

	// If the expression to pull in is empty, and we came from inside, move the cursor outside.
	if (!fromOutside && Expression.isEmpty(toPullIn)) {
		return {
			type: 'Expression',
			value: expressionValue,
			cursor: cursorAtBreak,
		}
	}

	// Set up the new parameter.
	const newParameter = {
		...parameter,
		value: [
			...toPullIn, // Add what needs to be pulled in.
			...parameter.value, // Take what was already there.
		],
	}

	// Set up the adjusted element.
	const newElement = {
		...element,
		value: [
			newParameter,
			...element.value.slice(1),
		],
	}

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			...toLeaveBehind, // Keep what is left behind in the Expression.
			newElement, // Add in the adjusted element.
			...expressionValue.slice(partIndex + 1), // Keep remaining elements.
		],
		cursor: {
			part: toLeaveBehind.length,
			cursor: {
				part: 0,
				cursor: Expression.getEndCursor(toPullIn), // Put the cursor at the end of the pulled-in expression.
			},
		},
	}
}

export function mergeWithRight(expressionValue, partIndex) {
	const element = expressionValue[partIndex]
	const parameter = lastOf(element.value)

	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind } = getMergeParts(expressionValue, partIndex, true, true)

	// Set up the new parameter.
	const newParameter = {
		...parameter,
		value: [
			...parameter.value, // Take what was already there.
			...toPullIn, // Add what needs to be pulled in.
		],
	}

	// Set up the adjusted element.
	const newElement = {
		...element,
		value: [
			...element.value.slice(0,-1),
			newParameter,
		],
	}

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex), // Keep previous expression elements.
			newElement, // Add in the adjusted element.
			...toLeaveBehind, // Keep what is left behind in the Expression.
		],
		cursor: {
			part: partIndex,
			cursor: {
				part: element.value.length - 1,
				cursor: getDataEndCursor(parameter), // Put the cursor at the end of the previous parameter.
			},
		},
	}
}

// getMergeParts takes an expression value and an index to a specific part. It then walks from this part outwards until it finds a break character (like a plus, minus or times symbol). It returns an object { toPullIn: [...], toLeaveBehind: [...], ... various cursors ... } with the expression parts to pull in and to leave behind in the given direction.
export function getMergeParts(expressionValue, partIndex, toRight, skipFirst) {
	// Find the cursor positions where we need to split things.
	const edgeElementIndex = partIndex + (toRight ? 1 : -1)
	const cursorAtEdgeOfElement = {
		part: edgeElementIndex,
		cursor: (toRight ? getDataStartCursor : getDataEndCursor)(expressionValue[edgeElementIndex]),
	}
	const dummyExpression = {
		type: 'Expression',
		value: expressionValue,
		cursor: cursorAtEdgeOfElement,
	}
	const cursorAtBreak = findEndOfTerm(dummyExpression, toRight, skipFirst)
	const cursorAtEnd = toRight ? Expression.getEndCursor(expressionValue) : Expression.getStartCursor(expressionValue)

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