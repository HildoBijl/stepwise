

import { addCursor, removeCursor } from '../Input'

import * as General from './index'
import * as ExpressionPart from './ExpressionPart'
import * as Expression from './Expression'

export function toLatex(value) {
	return `\\frac{${General.toLatex(value.num)}}{${General.toLatex(value.den)}}`
}

export function getLatexChars(value) {
	return [General.getLatexChars(value.den), General.getLatexChars(value.num)] // Katex puts the denominator first in its HTML rendering.
}

export function getCursorProperties(data, charElements, container) {
	const { cursor, value } = data
	return General.getCursorProperties({
		...value[cursor.part],
		cursor: cursor.cursor,
	}, charElements[cursor.part === 'den' ? 0 : 1], container)
}

export function keyPressToData(keyInfo, data, charElements, mainExpressionData, mainExpressionElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[cursor.part === 'den' ? 0 : 1], mainExpressionData, mainExpressionElement)
		return {
			...data,
			value: {
				...value,
				[cursor.part]: removeCursor(adjustedElement),
			},
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part === 'den' && General.isCursorAtStart(addCursor(value.den, cursor.cursor)))
		return { ...data, cursor: { part: 'num', cursor: General.getEndCursor(value.num) } } // Move to the end of the numerator.
	if (key === 'ArrowRight' && cursor.part === 'num' && General.isCursorAtEnd(addCursor(value.num, cursor.cursor)))
		return { ...data, cursor: { part: 'den', cursor: General.getStartCursor(value.den) } } // Move to the start of the denominator.

	// For backspace/delete check if we should destroy the fraction.
	if ((key === 'Backspace' && cursor.part === 'den' && General.isCursorAtStart(addCursor(value.den, cursor.cursor))) || (key === 'Delete' && cursor.part === 'num' && General.isCursorAtEnd(addCursor(value.num, cursor.cursor)))) {
		// Turn it into an expression with the respective parts.
		return Expression.cleanUp({
			type: 'Expression',
			value: [
				value.num, // Plug the numerator in here. The clean-up will spread it out.
				{ type: 'ExpressionPart', value: ExpressionPart.getEmpty() },
				value.den, // Plug the denominator in here. The clean-up will spread it out.
			],
			cursor: {
				part: 1, // In the new ExpressionPart.
				cursor: ExpressionPart.getStartCursor(),
			},
		})
	}

	// Pass on to the appropriate child element.
	return passOn()
}

export function getStartCursor(value) {
	return { part: 'num', cursor: Expression.getStartCursor(value.num.value) }
}

export function getEndCursor(value) {
	return { part: 'den', cursor: Expression.getEndCursor(value.den.value) }
}

export function isCursorAtStart(value, cursor) {
	return cursor.part === 'num' && Expression.isCursorAtStart(value.num.value, cursor.cursor)
}

export function isCursorAtEnd(value, cursor) {
	return cursor.part === 'den' && Expression.isCursorAtEnd(value.den.value, cursor.cursor)
}

export function getEmpty() {
	return {
		num: { type: 'Expression', value: Expression.getEmpty() },
		den: { type: 'Expression', value: Expression.getEmpty() },
	}
}

export function isEmpty(value) {
	return Expression.isEmpty(value.num.value) && Expression.isEmpty(value.den.value)
}