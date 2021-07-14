
import { isNumber } from 'step-wise/util/numbers'
import { isLetter, removeAtIndex } from 'step-wise/util/strings'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { latexMinus } from 'ui/components/equations'

import { emptyElementChar, emptyElementCharLatex } from '../../MathWithCursor'
import ExpressionPart, { addStrToData } from '../ExpressionPart'
import { isCursorKey } from '../support/acceptsKey'

const { getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd } = ExpressionPart

const allFunctions = {
	...ExpressionPart,
	toLatex,
	acceptsKey,
	keyPressToData,
}
export default allFunctions

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

export function acceptsKey(keyInfo, data) {
	if (isCursorKey(keyInfo, data))
		return true

	const { key } = keyInfo
	if (isLetter(key) || isNumber(key))
		return true
	if (key === '.' || key === ',')
		return true
	if (key === '+')
		return true
	if (key === '-')
		return true
	if (key === '*')
		return true
	if (key === '=')
		return true
	if (greekAlphabet[key] !== undefined)
		return true

	// Nothing found.
	return false
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const { value, cursor } = data

	// Verify the key.
	if (!acceptsKey(keyInfo, data))
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
		return addStrToData(key, data)
	if (key === '.' || key === ',') // Basic symbols.
		return addStrToData(key, data)
	if (key === '+') // Plus.
		return addStrToData('+', data)
	if (key === '-') // Minus.
		return addStrToData('-', data)
	if (key === '*') // Times.
		return addStrToData('*', data)
	if (key === '=') // Equals.
		return addStrToData('=', data)
	if (greekAlphabet[key] !== undefined)
		return addStrToData(greekAlphabet[key].symbol, data)

	// Unknown character.
	throw new Error(`Unknown character processing: received the key "${key}" which got accepted, but did not know how to process this.`)
}