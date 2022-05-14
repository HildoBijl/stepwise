// This is the most general template for settings up accents.

import { removeAtIndex } from 'step-wise/util/strings'
import { support } from 'step-wise/CAS'

import { getDataStartCursor, getDataEndCursor } from '../../'
import ExpressionPart, { addStrToData } from '../../ExpressionPart'
import { keyPressToData as expressionKeyPressToData } from '../../Expression'

import { isCursorKey } from '../../support/acceptsKey'

import { isAcceptableChar, filterAcceptableChar } from '../'

const { getSubExpression, findNextClosingBracket } = support

const { getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, isEmpty } = ExpressionPart

const allFunctions = {
	...ExpressionPart,
	create,
	toLatex,
	acceptsKey,
	keyPressToData,
	shouldRemove,
	canMerge,
	merge,
}
export default allFunctions

export function create(expressionData, part, position, name, alias) {
	let { value } = expressionData
	const expressionPart = value[part]
	const positionAfter = position + alias.length

	// Define cursors.
	const start = getDataStartCursor(expressionData)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: positionAfter }
	const endOfTerm = findNextClosingBracket(value, afterAlias)
	const end = getDataEndCursor(expressionData)

	// Check if there is a bracket after the alias. If not, leave the accent empty.
	let parameter = ''
	let continueFrom = afterAlias
	if (endOfTerm.cursor > 0 && value[endOfTerm.part].value[endOfTerm.cursor] === ')') {
		parameter = expressionPart.value.substring(positionAfter, endOfTerm.cursor)
		continueFrom = { ...endOfTerm, cursor: endOfTerm.cursor + 1 }
	}

	// Set up the new function element.
	const accentElement = {
		type: 'Accent',
		name,
		alias,
		value: filterAcceptableChar(parameter),
	}

	// Build the new Expression around it.
	const expressionBefore = getSubExpression(value, start, beforeAlias)
	const expressionAfter = getSubExpression(value, continueFrom, end)
	value = [
		...expressionBefore,
		accentElement,
		...expressionAfter,
	]
	return {
		...expressionData,
		value,
		cursor: {
			part: value.indexOf(accentElement),
			cursor: getDataStartCursor(accentElement),
		},
	}
}

export function toLatex(data) {
	throw new Error(`Missing function error: the accent component "${data && data.name}" has not implemented the toLatex function.`)
}

export function acceptsKey(keyInfo, data, settings) {
	const { key } = keyInfo
	return isCursorKey(keyInfo, data) || isAcceptableChar(key)
}

export function keyPressToData(keyInfo, data, settings, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = data

	// Verify the key.
	if (!acceptsKey(keyInfo, data, settings))
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft')
		return { ...data, cursor: Math.max(cursor - 1, 0) }
	if (key === 'ArrowRight')
		return { ...data, cursor: Math.min(cursor + 1, value.length) }
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
			...data,
			value: removeAtIndex(value, cursor),
		}
	}

	// Check for additions.
	if (isAcceptableChar(key))
		return addStrToData(key, data)

	// Unknown character.
	throw new Error(`Unknown character processing: received the key "${key}" which got accepted, but did not know how to process this.`)
}

export function shouldRemove(data) {
	return isEmpty(data.value)
}

export function canMerge() {
	return true
}

export function merge(data, partIndex, mergeWithNext, fromOutside) {
	const { value } = data

	// If we are from outside, put the cursor inside and process the corresponding keypress.
	if (fromOutside) {
		const accentData = value[partIndex]
		const accentCursor = (mergeWithNext ? getDataEndCursor : getDataStartCursor)(accentData)
		const expressionData = {
			...data,
			value: value,
			cursor: {
				part: partIndex,
				cursor: accentCursor,
			}
		}
		const keyInfo = { key: mergeWithNext ? 'Backspace' : 'Delete' }
		return expressionKeyPressToData(keyInfo, expressionData)
	}

	// If we are from inside, put the cursor outside and process the corresponding keypress.
	const accentData = value[partIndex]
	const part = mergeWithNext ? partIndex + 1 : partIndex - 1
	const elementData = value[part]
	const elementCursor = (mergeWithNext ? getDataStartCursor : getDataEndCursor)(elementData)
	const expressionData = {
		...data,
		value: value,
		cursor: {
			part,
			cursor: elementCursor,
		}
	}

	// Run an extra check: if the accent is empty, just remove the accent. Not the character prior to it.
	if (isEmpty(accentData.value))
		return expressionData // By moving the cursor, the element will get automatically removed by the clean-up.

	// No exception cases. Apply the key as planned.
	const keyInfo = { key: mergeWithNext ? 'Delete' : 'Backspace' }
	return expressionKeyPressToData(keyInfo, expressionData)
}