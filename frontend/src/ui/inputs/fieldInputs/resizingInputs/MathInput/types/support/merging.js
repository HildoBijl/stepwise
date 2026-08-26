import { sliceExpressionValue, findEndOfFactor } from '@step-wise/math-input-value'

import { expressionFunctions, getFIStartCursor, getFIEndCursor, getConstructPart, getFirstConstructPart } from '..'

export function mergeWithLeft(FI, partIndex, fromOutside) {
	const { value } = FI
	const element = value[partIndex]
	const parameterPart = getFirstConstructPart(element)
	const parameter = getConstructPart(element, parameterPart)
	
	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind, cursorAtBreak } = getMergeParts(value, partIndex, false, true)

	// If the expression to pull in is empty, and we came from inside, move the cursor outside.
	if (!fromOutside && expressionFunctions.isEmpty(toPullIn)) {
		return {
			...FI,
			value: value,
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
		[parameterPart]: newParameter.value,
	}

	// Set up the complete expression.
	return {
		...FI,
		value: [
			...toLeaveBehind, // Keep what is left behind in the Expression.
			newElement, // Add in the adjusted element.
			...value.slice(partIndex + 1), // Keep remaining elements.
		],
		cursor: {
			part: toLeaveBehind.length,
			cursor: {
				part: parameterPart,
				cursor: expressionFunctions.getEndCursor(toPullIn), // Put the cursor at the end of the pulled-in expression.
			},
		},
	}
}

export function mergeWithRight(FI, partIndex) {
	const { value } = FI
	const element = value[partIndex]
	const parameterPart = getFirstConstructPart(element, true)
	const parameter = getConstructPart(element, parameterPart)

	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind } = getMergeParts(value, partIndex, true, true)

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
		[parameterPart]: newParameter.value,
	}

	// Set up the complete expression.
	return {
		...FI,
		value: [
			...value.slice(0, partIndex), // Keep previous expression elements.
			newElement, // Add in the adjusted element.
			...toLeaveBehind, // Keep what is left behind in the Expression.
		],
		cursor: {
			part: partIndex,
			cursor: {
				part: parameterPart,
				cursor: getFIEndCursor(parameter), // Put the cursor at the end of the previous parameter.
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
		cursor: (toRight ? getFIStartCursor : getFIEndCursor)(expressionValue[edgeElementIndex]),
	}
	const cursorAtBreak = findEndOfFactor(expressionValue, cursorAtEdgeOfElement, toRight, skipFirst)
	const cursorAtEnd = toRight ? expressionFunctions.getEndCursor(expressionValue) : expressionFunctions.getStartCursor(expressionValue)

	// Apply the proper split.
	const toPullIn = toRight ?
		sliceExpressionValue(expressionValue, cursorAtEdgeOfElement, cursorAtBreak) :
		sliceExpressionValue(expressionValue, cursorAtBreak, cursorAtEdgeOfElement)
	const toLeaveBehind = toRight ?
		sliceExpressionValue(expressionValue, cursorAtBreak, cursorAtEnd) :
		sliceExpressionValue(expressionValue, cursorAtEnd, cursorAtBreak)

	// Return the result, including cursors.
	return {
		toPullIn,
		toLeaveBehind,
		cursorAtEdgeOfElement,
		cursorAtBreak,
		cursorAtEnd,
	}
}
