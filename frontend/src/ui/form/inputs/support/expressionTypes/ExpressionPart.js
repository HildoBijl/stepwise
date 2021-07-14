import { decimalSeparator } from 'step-wise/settings'
import { isNumber } from 'step-wise/util/numbers'
import { isLetter, removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import { firstOf } from 'step-wise/util/arrays'
import { alphabet as greekAlphabet } from 'step-wise/data/greek'

import { getClickSide } from 'util/dom'

import { latexMinus } from 'ui/components/equations'

import { emptyElementChar, emptyElementCharLatex, isCharElementEmpty, getCursorPropertiesFromElements, getClosestElement } from '../MathWithCursor'
import Expression from './Expression'
import { getDeepestExpression } from './support/ExpressionSupport'
import { isCursorKey } from './support/acceptsKey'

const basicFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'arcsin', 'arccos', 'arctan', 'ln']
const advancedFunctions = ['root', 'log']
const accents = ['dot', 'hat']
export { basicFunctions, accents, advancedFunctions }

const autoReplaceSymbols = [
	{ name: 'pm', symbol: '±' },
	{ name: 'mp', symbol: '∓' },
	...Object.values(greekAlphabet),
]

const allFunctions = {
	toLatex,
	getCursorProperties,
	acceptsKey,
	keyPressToData,
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

export function toLatex(data, options = {}) {
	return {
		latex: getLatex(data, options),
		chars: getLatexChars(data, options),
	}
}

function getLatex(data, options) {
	const { value } = data
	const { index, beforeSubSupWithBrackets } = options

	// Check for empty ExpressionParts.
	if (value === '')
		return emptyElementCharLatex

	// Apply non-italic text for basic functions. To do so, for any text (only letters) followed by a bracket, turn the text in non-italic form.
	let latex = value
	latex = latex.replace(/[a-zA-Z]+(?=\()/g, func => basicFunctions.includes(func) ? `{\\rm ${func}}\\!` : `${func}\\!`) // Add a negative space to bring the bracket closer.
	if (beforeSubSupWithBrackets)
		latex = latex.replace(/[a-zA-Z]+$/g, func => basicFunctions.includes(func) ? `{\\rm ${func}}` : func) // Don't add a negative space since a subscript follows.

	// If a string begins with a bracket, add some negative spacing.
	if (index > 0 && latex[0] === '(')
		latex = `\\!${latex}`

	// Replace stars by dots.
	latex = latex.replace(/\*/g, '\\cdot ')

	// Replace a period by the default decimal separator, but only when not preceded by \left or \right or \ (a backslash itself).
	// Prevent Latex from messing up commas.
	const replacement = decimalSeparator === ',' ? '{,}' : decimalSeparator
	latex = latex.replace(/(?<!(\\left)|(\\right)|(\\))[.,]/g, substr => substr.replace('.', replacement).replace(',', replacement))

	// All done.
	return latex
}

function getLatexChars(data) {
	let { value } = data
	if (value === '')
		return emptyElementChar.split('')

	value = value.replace(/\*/g, '⋅') // This is what appears for the cdot.
	value = value.replace(/\./g, decimalSeparator) // Decimal separator for language-dependent processing of numbers.
	value = value.replace(/-/g, latexMinus) // Latex minuses.
	return value.split('')
}

function getCursorProperties(data, charElements, container) {
	const { cursor } = data
	return getCursorPropertiesFromElements(charElements[cursor - 1], charElements[cursor], container)
}

export function acceptsKey(keyInfo, data) {
	if (isCursorKey(keyInfo, data))
		return true

	const { key } = keyInfo
	if (isLetter(key) || isNumber(key))
		return true
	if (key === '(' || key === ')')
		return true
	if (key === '+')
		return true
	if (key === '-')
		return true
	if (key === '*')
		return true
	if (key === '.' || key === ',')
		return true
	if (key === '/')
		return true
	if (key === '_')
		return true
	if (key === '^')
		return true
	if (greekAlphabet[key] !== undefined)
		return true
	if (basicFunctions.includes(key))
		return true
	if (accents.includes(key))
		return true
	if (advancedFunctions.includes(key))
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
		return { ...data, cursor: Math.max(cursor - 1, 0) } // Move one position to the left.
	if (key === 'ArrowRight')
		return { ...data, cursor: Math.min(cursor + 1, value.length) } // Move the cursor one position to the right.
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value) }

	// For backspace/delete, remove the appropriate symbol.
	if (key === 'Backspace' && !isCursorAtStart(value, cursor)) {
		// Check if we are removing an opening bracket and there's a closing bracket on the other side of the cursor too.
		if (value[cursor - 1] === '(' && value[cursor] === ')') {
			return {
				...data,
				value: removeAtIndex(value, cursor - 1, 2),
				cursor: cursor - 1,
			}
		}

		// Normal case.
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
		const parentExpressionData = getDeepestExpression(topParentData)
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
		const parentExpressionData = getDeepestExpression(topParentData)
		const netBracketsBefore = Expression.countNetBrackets(parentExpressionData, -1)
		const netBracketsAfter = Expression.countNetBrackets(parentExpressionData, 1)
		if (netBracketsBefore > -netBracketsAfter)
			return addStrToData(key, data) // There are too many opening brackets. Add a closing bracket.
		return { ...data, cursor: cursor + 1 } // There are insufficient opening brackets to warrant a closing bracket. Overwrite it, effectively moving the cursor one to the right.
	}

	// Check for additions.
	if (isLetter(key) || isNumber(key)) // Letters and numbers.
		return addStrToData(key, data)
	if (key === '+') // Plus.
		return addStrToData('+', data)
	if (key === '-') // Minus.
		return addStrToData('-', data)
	if (key === '*') // Times.
		return addStrToData('*', data)
	if (key === '.' || key === ',') // Period.
		return addStrToData('.', data)
	if (key === '/') // Fraction. Will be auto-replaced.
		return addStrToData('/', data)
	if (key === '_') // Will be auto-replaced by a SubSup.
		return addStrToData('_', data)
	if (key === '^') // Will be auto-replaced by a SubSup.
		return addStrToData('^', data)
	if (key === 'pi')
		return addStrToData(key, data)
	if (greekAlphabet[key] !== undefined)
		return addStrToData(greekAlphabet[key].symbol, data)

	// On mathematical functions, add the words and then add the bracket.
	if (basicFunctions.includes(key) || accents.includes(key) || advancedFunctions.includes(key)) {
		const dataWithKey = addStrToData(key, data)
		return keyPressToData({ key: '(' }, dataWithKey, charElements, topParentData, contentsElement, cursorElement)
	}

	// Unknown character.
	throw new Error(`Unknown character processing: received the key "${key}" which got accepted, but did not know how to process this.`)
}

// addStrToData adds a string into the data object, at the position of the cursor. It returns the new data object, with the cursor moved accordingly.
export function addStrToData(str, data) {
	const { value, cursor } = data
	return {
		...data,
		value: insertAtIndex(value, cursor, str),
		cursor: cursor + str.length,
	}
}

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	return firstOf(trace) + getClickSide(evt)
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
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

export function shouldRemove(data) {
	return isEmpty(data.value)
}

export function countNetBrackets(data, relativeToCursor) {
	const { value, cursor } = data
	const valuePart = relativeToCursor === 0 ? value : (relativeToCursor === -1 ? value.substring(0, cursor) : value.substring(cursor))
	return valuePart.split('(').length - valuePart.split(')').length
}

export function cleanUp(data) {
	return applyAutoReplace(data)
}

export function applyAutoReplace(data) {
	let { value, cursor } = data
	const hasCursor = !!cursor || cursor === 0

	// Apply an auto-replace on all auto-replace symbols. For each symbol, replace all instances and shift the cursor along accordingly.
	let found = false
	autoReplaceSymbols.forEach(symbol => {
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

	return found ? (hasCursor ? { ...data, value, cursor } : { ...data, value }) : data
}