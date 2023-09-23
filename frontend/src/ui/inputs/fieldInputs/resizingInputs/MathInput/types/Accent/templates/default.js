// This is the most general template for settings up accents.

import { removeAtIndex } from 'step-wise/util'
import { support as CASSupport } from 'step-wise/CAS'

import { getFIStartCursor, getFIEndCursor } from '../..'
import { allFunctions as expressionPartFunctions, addStrToFI } from '../../ExpressionPart'
import { keyPressToFI as expressionKeyPressToFI } from '../../Expression'
import { isCursorKey } from '../../support'

import { isAcceptableChar, filterAcceptableChar } from '../support'

const { getSubExpression, findNextClosingBracket } = CASSupport

const { getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, isEmpty } = expressionPartFunctions

export const allFunctions = {
	...expressionPartFunctions,
	create,
	toLatex,
	acceptsKey,
	keyPressToFI,
	shouldRemove,
	canMerge,
	merge,
}

export function create(expressionFI, part, position, name, alias) {
	let { value } = expressionFI
	const expressionPart = value[part]
	const positionAfter = position + alias.length

	// Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: positionAfter }
	const endOfTerm = findNextClosingBracket(value, afterAlias)
	const end = getFIEndCursor(expressionFI)

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
		...expressionFI,
		value,
		cursor: {
			part: value.indexOf(accentElement),
			cursor: getFIStartCursor(accentElement),
		},
	}
}

export function toLatex(FI) {
	throw new Error(`Missing function error: the accent component "${FI?.name}" has not implemented the toLatex function.`)
}

export function acceptsKey(keyInfo, FI, settings) {
	const { key } = keyInfo
	return isCursorKey(keyInfo, FI) || isAcceptableChar(key)
}

export function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = FI

	// Verify the key.
	if (!acceptsKey(keyInfo, FI, settings))
		return FI

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft')
		return { ...FI, cursor: Math.max(cursor - 1, 0) }
	if (key === 'ArrowRight')
		return { ...FI, cursor: Math.min(cursor + 1, value.length) }
	if (key === 'Home')
		return { ...FI, cursor: getStartCursor(value) }
	if (key === 'End')
		return { ...FI, cursor: getEndCursor(value) }

	// For backspace/delete, remove the appropriate symbol.
	if (key === 'Backspace' && !isCursorAtStart(value, cursor)) {
		return {
			...FI,
			value: removeAtIndex(value, cursor - 1),
			cursor: cursor - 1,
		}
	}
	if (key === 'Delete' && !isCursorAtEnd(value, cursor)) {
		return {
			...FI,
			value: removeAtIndex(value, cursor),
		}
	}

	// Check for additions.
	if (isAcceptableChar(key))
		return addStrToFI(key, FI)

	// Unknown character.
	throw new Error(`Unknown character processing: received the key "${key}" which got accepted, but did not know how to process this.`)
}

export function shouldRemove(FI) {
	return isEmpty(FI.value)
}

export function canMerge() {
	return true
}

export function merge(FI, partIndex, mergeWithNext, fromOutside) {
	const { value } = FI

	// If we are from outside, put the cursor inside and process the corresponding keypress.
	if (fromOutside) {
		const accentFI = value[partIndex]
		const accentCursor = (mergeWithNext ? getFIEndCursor : getFIStartCursor)(accentFI)
		const expressionFI = {
			...FI,
			value: value,
			cursor: {
				part: partIndex,
				cursor: accentCursor,
			}
		}
		const keyInfo = { key: mergeWithNext ? 'Backspace' : 'Delete' }
		return expressionKeyPressToFI(keyInfo, expressionFI)
	}

	// If we are from inside, put the cursor outside and process the corresponding keypress.
	const accentFI = value[partIndex]
	const part = mergeWithNext ? partIndex + 1 : partIndex - 1
	const elementFI = value[part]
	const elementCursor = (mergeWithNext ? getFIStartCursor : getFIEndCursor)(elementFI)
	const expressionFI = {
		...FI,
		value: value,
		cursor: {
			part,
			cursor: elementCursor,
		}
	}

	// Run an extra check: if the accent is empty, just remove the accent. Not the character prior to it.
	if (isEmpty(accentFI.value))
		return expressionFI // By moving the cursor, the element will get automatically removed by the clean-up.

	// No exception cases. Apply the key as planned.
	const keyInfo = { key: mergeWithNext ? 'Delete' : 'Backspace' }
	return expressionKeyPressToFI(keyInfo, expressionFI)
}
