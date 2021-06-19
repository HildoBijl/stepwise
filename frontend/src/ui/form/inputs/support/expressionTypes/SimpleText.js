
import { isNumber } from 'step-wise/util/numbers'
import { isLetter, removeAtIndex } from 'step-wise/util/strings'

import { latexMinus } from 'ui/components/equations'

import { emptyElementChar, emptyElementCharLatex } from '../MathWithCursor'
import * as ExpressionPart from './ExpressionPart'

export function toLatex(data, options = {}) {
	return {
		latex: getLatex(data, options),
		chars: getLatexChars(data, options),
	}
}

function getLatex(data) {
	const { value } = data
	return value === '' ? emptyElementCharLatex : `{\\rm ${value}}`
}

function getLatexChars(data) {
	let { value } = data
	if (value === '')
		return emptyElementChar.split('')

	value = value.replaceAll('*', '∗') // This is what appears for the star.
	value = value.replaceAll('-', latexMinus) // Latex minuses.
	return value.split('')
}

export function getCursorProperties(data, charElements, container) {
	return ExpressionPart.getCursorProperties(data, charElements, container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
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
	if (isLetter(key) || isNumber(key)) // Letters and numbers.
		return ExpressionPart.addStrToData(key, data)
	if (key === '.' || key === ',') // Basic symbols.
		return ExpressionPart.addStrToData(key, data)
	if (key === '+' || key === 'Plus') // Plus.
		return ExpressionPart.addStrToData('+', data)
	if (key === '-' || key === 'Minus') // Minus.
		return ExpressionPart.addStrToData('-', data)
	if (key === '*' || key === 'Times') // Times.
		return ExpressionPart.addStrToData('*', data)
	if (key === '=' || key === 'Equals') // Equals.
		return ExpressionPart.addStrToData('=', data)

	// Unknown key. Ignore, do nothing.
	return data
}

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	return ExpressionPart.charElementClickToCursor(evt, data, trace, charElements, equationElement)
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	return ExpressionPart.coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement)
}

export function getStartCursor(value) {
	return ExpressionPart.getStartCursor(value)
}

export function getEndCursor(value) {
	return ExpressionPart.getEndCursor(value)
}

export function isCursorAtStart(value, cursor) {
	return ExpressionPart.isCursorAtStart(value, cursor)
}

export function isCursorAtEnd(value, cursor) {
	return ExpressionPart.isCursorAtEnd(value, cursor)
}

export function getEmpty() {
	return ExpressionPart.getEmpty()
}

export function isEmpty(value) {
	return ExpressionPart.isEmpty(value)
}

export function shouldRemove(data) {
	return ExpressionPart.shouldRemove(data)
}

export function cleanUp(data) {
	return ExpressionPart.applyAutoReplace(data)
}