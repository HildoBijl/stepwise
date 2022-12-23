import { decimalSeparator, decimalSeparatorTex } from 'step-wise/settings/numbers'
import { isNumber } from 'step-wise/util/numbers'
import { isLetter, removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import { firstOf } from 'step-wise/util/arrays'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'
import { functions } from 'step-wise/CAS'

import { getClickSide } from 'util/dom'

import { latexMinus } from 'ui/components/equations'

import { emptyElementChar, emptyElementCharLatex, isCharElementEmpty, getCursorPropertiesFromElements, getClosestElement } from '../MathWithCursor'

import Expression from './Expression'
import { getDeepestExpression } from './support/ExpressionSupport'
import { isCursorKey } from './support/acceptsKey'

const { basicFunctions, advancedFunctions, accents } = functions

const pmSymbols = [
	{ name: 'pm', symbol: '±' },
	{ name: 'mp', symbol: '∓' },
]
const autoReplaceSymbols = [
	...pmSymbols,
	...Object.values(greekAlphabet),
]
const autoReplaceSymbolsWithoutGreek = [
	...pmSymbols,
	{ name: 'pi', symbol: 'π' },
	{ name: 'inf', symbol: '∞' },
]

const allFunctions = {
	toLatex,
	getCursorProperties,
	acceptsKey,
	keyPressToFI,
	charElementClickToCursor,
	coordinatesToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	getEmpty,
	isEmpty,
	shouldRemove,
	countNetBrackets,
	cleanUp,
}
export default allFunctions

export function getFuncs() {
	return allFunctions
}

export function toLatex(FI, options = {}) {
	return {
		latex: getLatex(FI, options),
		chars: getLatexChars(FI, options),
	}
}

function getLatex(FI, options) {
	const { value } = FI
	const { index, beforeSubSupWithBrackets } = options

	// Check for empty ExpressionParts.
	if (value === '')
		return emptyElementCharLatex

	// Apply non-italic text for basic functions. To do so, for any text (only letters) followed by a bracket, turn the text in non-italic form.
	let latex = value
	latex = latex.replace(/[a-zA-Z]+(?=\()/g, func => basicFunctions.includes(func) ? `{\\rm ${func}}` : `${func}`)
	if (beforeSubSupWithBrackets)
		latex = latex.replace(/[a-zA-Z]+$/g, func => basicFunctions.includes(func) ? `{\\rm ${func}}` : func) // Don't add a negative space since a subscript follows.

	// If a string begins with a bracket, add some negative spacing.
	if (index > 0 && latex[0] === '(')
		latex = `\\!${latex}`

	// Replace stars by dots.
	latex = latex.replace(/\*/g, '\\cdot ')

	// Replace a period by the default decimal separator, but only when not preceded by \left or \right or \ (a backslash itself).
	const latexSplit = latex.split('.')
	latex = latexSplit.map((str, index) => {
		if (index === latexSplit.length - 1)
			return str // Don't change the last string.
		if (str.endsWith('\\left') || str.endsWith('\\right') || str.endsWith('\\'))
			return `${str}.` // Add a period after this string.
		return `${str}${decimalSeparatorTex}` // Apply the decimalSeparator.
	}).join('')

	// All done.
	return latex
}

function getLatexChars(FI) {
	let { value } = FI
	if (value === '')
		return emptyElementChar.split('')

	value = value.replace(/\*/g, '⋅') // This is what appears for the cdot.
	value = value.replace(/\./g, decimalSeparator) // Decimal separator for language-dependent processing of numbers.
	value = value.replace(/-/g, latexMinus) // Latex minuses.
	return value.split('')
}

function getCursorProperties(FI, charElements, container) {
	const { cursor } = FI
	return getCursorPropertiesFromElements(charElements[cursor - 1], charElements[cursor], container)
}

export function acceptsKey(keyInfo, FI, settings) {
	if (isCursorKey(keyInfo, FI))
		return true

	const { key } = keyInfo
	if (isLetter(key) || isNumber(key))
		return true
	if (key === '.' || key === ',')
		return settings.float
	if (key === '+')
		return settings.plus
	if (key === '-')
		return settings.minus
	if (key === '*')
		return settings.times
	if (key === '/')
		return settings.divide
	if (key === '(' || key === ')')
		return settings.brackets
	if (key === '^')
		return settings.power
	if (key === '_')
		return settings.subscript
	if (key === 'sin' || key === 'cos' || key === 'tan' || key === 'asin' || key === 'acos' || key === 'atan')
		return settings.trigonometry
	if (key === 'sqrt' || key === 'root')
		return settings.root
	if (key === 'ln' || key === 'log')
		return settings.logarithm
	if (accents.includes(key))
		return settings.accent
	if (greekAlphabet[key] !== undefined)
		return key === 'pi' || settings.greek
	if (basicFunctions.includes(key) || advancedFunctions.includes(key))
		return true
	if (key === '=')
		return settings.equals

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
		return { ...FI, cursor: Math.max(cursor - 1, 0) } // Move one position to the left.
	if (key === 'ArrowRight')
		return { ...FI, cursor: Math.min(cursor + 1, value.length) } // Move the cursor one position to the right.
	if (key === 'Home')
		return { ...FI, cursor: getStartCursor(value) }
	if (key === 'End')
		return { ...FI, cursor: getEndCursor(value) }

	// For backspace/delete, remove the appropriate symbol.
	if (key === 'Backspace' && !isCursorAtStart(value, cursor)) {
		// Check if we are removing an opening bracket and there's a closing bracket on the other side of the cursor too.
		if (value[cursor - 1] === '(' && value[cursor] === ')') {
			return {
				...FI,
				value: removeAtIndex(value, cursor - 1, 2),
				cursor: cursor - 1,
			}
		}

		// Normal case.
		return {
			...FI,
			value: removeAtIndex(value, cursor - 1),
			cursor: cursor - 1,
		}
	}
	if (key === 'Delete' && !isCursorAtEnd(value, cursor)) {
		return {
			...FI, // Keep cursor as is.
			value: removeAtIndex(value, cursor),
		}
	}

	// For brackets, check if we need to apply a bracket trick. For the opening bracket add a closing bracket, and for the closing bracket skip over it.
	if (key === '(') {
		const parentExpressionFI = getDeepestExpression(topParentFI)
		const netBracketsBefore = Expression.countNetBrackets(parentExpressionFI, -1)
		const netBracketsAfter = Expression.countNetBrackets(parentExpressionFI, 1)
		if (netBracketsBefore < -netBracketsAfter)
			return addStrToFI(key, FI) // There already is a closing bracket too much after the cursor. Just add an opening bracket.
		return { // There are not sufficient opening brackets after the cursor. Add a closing bracket and put the cursor in-between.
			...FI,
			value: insertAtIndex(value, cursor, '()'),
			cursor: cursor + 1,
		}
	}
	if (key === ')') {
		// If we are not in front of a closing bracket, just add one.
		if (value[cursor] !== ')')
			return addStrToFI(key, FI)

		// We are in front of a closing bracket. Should we override it?
		const parentExpressionFI = getDeepestExpression(topParentFI)
		const netBracketsBefore = Expression.countNetBrackets(parentExpressionFI, -1)
		const netBracketsAfter = Expression.countNetBrackets(parentExpressionFI, 1)
		if (netBracketsBefore > -netBracketsAfter)
			return addStrToFI(key, FI) // There are too many opening brackets. Add a closing bracket.
		return { ...FI, cursor: cursor + 1 } // There are insufficient opening brackets to warrant a closing bracket. Overwrite it, effectively moving the cursor one to the right.
	}

	// Check for additions.
	if (isLetter(key) || isNumber(key)) // Letters and numbers.
		return addStrToFI(key, FI)
	if (key === '+') // Plus.
		return addStrToFI('+', FI)
	if (key === '-') // Minus.
		return addStrToFI('-', FI)
	if (key === '*') // Times.
		return addStrToFI('*', FI)
	if (key === '.' || key === ',') // Period.
		return addStrToFI('.', FI)
	if (key === '/') // Fraction. Will be auto-replaced.
		return addStrToFI('/', FI)
	if (key === '_') // Will be auto-replaced by a SubSup.
		return addStrToFI('_', FI)
	if (key === '^') // Will be auto-replaced by a SubSup.
		return addStrToFI('^', FI)
	if (key === 'pi')
		return addStrToFI(key, FI)
	if (greekAlphabet[key] !== undefined)
		return addStrToFI(greekAlphabet[key].symbol, FI)
	if (key === '=')
		return addStrToFI(key, FI)

	// On mathematical functions, add the words and then add the bracket.
	if (basicFunctions.includes(key) || accents.includes(key) || advancedFunctions.includes(key)) {
		const FIWithKey = addStrToFI(key, FI)
		return keyPressToFI({ key: '(' }, FIWithKey, settings, charElements, topParentFI, contentsElement, cursorElement)
	}

	// Unknown character.
	throw new Error(`Unknown character processing: received the key "${key}" which got accepted, but did not know how to process this.`)
}

// addStrToFI adds a string into the FI object, at the position of the cursor. It returns the new FI object, with the cursor moved accordingly.
export function addStrToFI(str, FI) {
	const { value, cursor } = FI
	return {
		...FI,
		value: insertAtIndex(value, cursor, str),
		cursor: cursor + str.length,
	}
}

export function charElementClickToCursor(evt, FI, trace, charElements, equationElement) {
	return firstOf(trace) + getClickSide(evt)
}

export function coordinatesToCursor(coordinates, boundsData, FI, charElements, contentsElement) {
	// Extract which character was closest to the click.
	const part = getClosestElement(coordinates, boundsData)

	// If the element is empty, put the cursor on its left side.
	const charElement = charElements[part]
	if (isCharElementEmpty(charElement))
		return part

	// Check which side of the element was closest to the click.
	const partBounds = boundsData.parts[part].bounds
	const side = (coordinates.x - partBounds.left + 1) * 2 >= (partBounds.right - partBounds.left) ? 1 : 0
	return part + side
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

export function shouldRemove(FI) {
	return isEmpty(FI.value)
}

export function countNetBrackets(FI, relativeToCursor) {
	const { value, cursor } = FI
	const valuePart = relativeToCursor === 0 ? value : (relativeToCursor === -1 ? value.substring(0, cursor) : value.substring(cursor))
	return valuePart.split('(').length - valuePart.split(')').length
}

export function cleanUp(FI, settings) {
	return applyAutoReplace(FI, settings)
}

export function applyAutoReplace(FI, settings) {
	let { value, cursor } = FI
	const hasCursor = !!cursor || cursor === 0

	// Apply an auto-replace on all auto-replace symbols. For each symbol, replace all instances and shift the cursor along accordingly.
	let found = false
	const symbols = settings.greek ? autoReplaceSymbols : autoReplaceSymbolsWithoutGreek
	symbols.forEach(symbol => {
		let position = value.search(symbol.name)
		while (position !== -1) {
			found = true
			value = value.replace(symbol.name, symbol.symbol)
			if (cursor !== null) {
				if (cursor > position && cursor <= position + symbol.name.length)
					cursor = position + symbol.symbol.length
				if (cursor > position + symbol.name.length)
					cursor -= (symbol.name.length - symbol.symbol.length)
			}
			position = value.search(symbol.name)
		}
	})

	return found ? (hasCursor ? { ...FI, value, cursor } : { ...FI, value }) : FI
}