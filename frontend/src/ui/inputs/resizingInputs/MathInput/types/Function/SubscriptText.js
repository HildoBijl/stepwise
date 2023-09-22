
import { isNumber, isLetter, removeAtIndex } from 'step-wise/util'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { latexMinus } from 'ui/components/math'

import { emptyElementChar, emptyElementCharLatex } from '../..'

import { allFunctions as expressionPartFunctions, addStrToFI } from '../ExpressionPart'
import { isCursorKey } from '../support'

const { getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd } = expressionPartFunctions

export const allFunctions = {
	...expressionPartFunctions,
	toLatex,
	acceptsKey,
	keyPressToFI,
}

export function getFuncs() {
	return allFunctions
}

export function toLatex(FI, options = {}) {
	return {
		latex: getLatex(FI, options),
		chars: getLatexChars(FI, options),
	}
}

function getLatex(FI) {
	const { value } = FI
	return value === '' ? emptyElementCharLatex : `{\\rm ${value}}`
}

function getLatexChars(FI) {
	let { value } = FI
	if (value === '')
		return emptyElementChar.split('')

	value = value.replace(/\*/g, '∗') // This is what appears for the star.
	value = value.replace(/-/g, latexMinus) // Latex minuses.
	return value.split('')
}

export function acceptsKey(keyInfo, FI, settings) {
	if (isCursorKey(keyInfo, FI, settings))
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
	if (isLetter(key) || isNumber(key)) // Letters and numbers.
		return addStrToFI(key, FI)
	if (key === '.' || key === ',') // Basic symbols.
		return addStrToFI(key, FI)
	if (key === '+') // Plus.
		return addStrToFI('+', FI)
	if (key === '-') // Minus.
		return addStrToFI('-', FI)
	if (key === '*') // Times.
		return addStrToFI('*', FI)
	if (key === '=') // Equals.
		return addStrToFI('=', FI)
	if (greekAlphabet[key] !== undefined)
		return addStrToFI(greekAlphabet[key].symbol, FI)

	// Unknown character.
	throw new Error(`Unknown character processing: received the key "${key}" which got accepted, but did not know how to process this.`)
}
