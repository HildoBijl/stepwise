
import { isNumber } from 'step-wise/util/numbers'
import { isLetter, removeAtIndex, insertAtIndex } from 'step-wise/util/strings'

import * as Expression from './Expression'

export function toLatex(value) {
	return value
}

export function keyPressToData(keyInfo, data, contentsElement, expressionData, expressionContentsElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft')
		return { ...data, cursor: Math.max(cursor - 1, 0) } // Move one position to the left.
	if (key === 'ArrowRight')
		return { ...data, cursor: Math.min(cursor + 1, value.length) } // Move the cursor one position to the right.
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value) }

	// For backspace/delete, remove the appropriate symbol.
	if (key === 'Backspace' && !isCursorAtStart(value, cursor)) {
		return {
			...data,
			value: removeAtIndex(value, cursor - 1),
			cursor: cursor - 1,
		}
	}
	if (key === 'Delete' && !isCursorAtEnd(value, cursor)) {
		return {
			...data, // Keep cursor as is.
			value: removeAtIndex(value, cursor),
		}
	}

	// For brackets, check if we need to apply a bracket trick. For the opening bracket add a closing bracket, and for the closing bracket skip over it.
	if (key === '(') {
		const parentExpressionData = Expression.getDeepestExpression(expressionData)
		const netBracketsBefore = Expression.countNetBrackets(parentExpressionData, -1)
		const netBracketsAfter = Expression.countNetBrackets(parentExpressionData, 1)
		if (netBracketsBefore < -netBracketsAfter)
			return addStrToData(key, data) // There already is a closing bracket too much after the cursor. Just add an opening bracket.
		return { // There are not sufficient opening brackets after the cursor. Add a closing bracket and put the cursor in-between.
			...data,
			value: insertAtIndex(value, cursor, '()'),
			cursor: cursor + 1,
		}
	}
	if (key === ')') {
		// If we are not in front of a closing bracket, just add one.
		if (value[cursor] !== ')')
			return addStrToData(key, data)

		// We are in front of a closing bracket. Should we override it?
		const parentExpressionData = Expression.getDeepestExpression(expressionData)
		const netBracketsBefore = Expression.countNetBrackets(parentExpressionData, -1)
		const netBracketsAfter = Expression.countNetBrackets(parentExpressionData, 1)
		if (netBracketsBefore > -netBracketsAfter)
			return addStrToData(key, data) // There are too many opening brackets. Add a closing bracket.
		return { ...data, cursor: cursor + 1 } // There are insufficient opening brackets to warrant a closing bracket. Overwrite it, effectively moving the cursor one to the right.
	}

	// Check for additions.
	if (isLetter(key) || isNumber(key)) // Letters and numbers.
		return addStrToData(key, data)
	if (key === '+' || key === 'Plus') // Plus.
		return addStrToData('+', data)
	if (key === '-' || key === 'Minus') // Minus.
		return addStrToData('-', data)
	if (key === '*' || key === 'Times') // Times.
		return addStrToData('*', data)
	if (key === '.' || key === ',') // Period.
		return addStrToData('.', data)

	// Unknown key. Ignore, do nothing.
	return data
}

// addStrToData adds a string into the data object, at the position of the cursor. It returns the new data object, with the cursor moved accordingly.
function addStrToData(str, data) {
	const { value, cursor } = data
	return {
		...data,
		value: insertAtIndex(value, cursor, str),
		cursor: cursor + str.length,
	}
}

export function getStartCursor(value) {
	return 0
}

export function getEndCursor(value) {
	return value.length
}

export function isCursorAtStart(value, cursor) {
	return cursor === 0
}

export function isCursorAtEnd(value, cursor) {
	return cursor === value.length
}

export function getEmpty() {
	return ''
}

export function isEmpty(value) {
	return value.length === 0
}

export function countNetBrackets(data, relativeToCursor) {
	const { value, cursor } = data
	const valuePart = relativeToCursor === 0 ? value : (relativeToCursor === -1 ? value.substring(0, cursor) : value.substring(cursor))
	return valuePart.split('(').length - valuePart.split(')').length
}