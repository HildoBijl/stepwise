import { addCursor, removeCursor } from '../Input'
import { getClosestElement, charElementsToBounds } from '../MathWithCursor'

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

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[cursor.part === 'den' ? 0 : 1], topParentData, contentsElement, cursorElement)
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

	// Get the active element.
	const activeElement = value[cursor.part]
	const activeElementCursor = cursor.cursor
	const activeElementData = addCursor(activeElement, activeElementCursor)

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft' && cursor.part === 'den' && General.isCursorAtStart(activeElementData))
		return { ...data, cursor: { part: 'num', cursor: General.getEndCursor(value.num) } } // Move to the end of the numerator.
	if (key === 'ArrowRight' && cursor.part === 'num' && General.isCursorAtEnd(activeElementData))
		return { ...data, cursor: { part: 'den', cursor: General.getStartCursor(value.den) } } // Move to the start of the denominator.

	// For up/down arrows, check if we can/need to move up.
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		const up = key === 'ArrowUp'
		// Can we relegate this to a child? If so, pass it on.
		if (General.canMoveCursorVertically(activeElementData, up))
			return passOn()

		// We cannot relegate it. Can we move up/down here?
		if ((up && cursor.part === 'num') || (!up && cursor.part === 'den'))
			return data // We cannot do this. Don't move the cursor.

		// We can move in the right direction. Use the coordinates to get the right cursor position.
		const part = up ? 'num' : 'den'
		const partCharElements = charElements[part === 'den' ? 0 : 1]
		const boundsData = charElementsToBounds(partCharElements)
		const rect = cursorElement.getBoundingClientRect()
		const cursorMiddle = { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 }
		return {
			...data,
			cursor: {
				part,
				cursor: General.coordinatesToCursor(cursorMiddle, boundsData, value[part], partCharElements, contentsElement),
			}
		}
	}

	// For backspace/delete check if we should destroy the fraction.
	if ((key === 'Backspace' && cursor.part === 'den' && General.isCursorAtStart(activeElementData)) || (key === 'Delete' && cursor.part === 'num' && General.isCursorAtEnd(activeElementData))) {
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

export function canMoveCursorVertically(data, up) {
	// Can we go in the given direction inside the fraction? If so, it's a definite true. Otherwise check the child element.
	const { value, cursor } = data
	if ((up && cursor.part === 'den') || (!up && cursor.part === 'num'))
		return true
	return General.canMoveCursorVertically(addCursor(value[cursor.part], cursor.cursor), up)
}

export function charElementClickToCursor(evt, value, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const traceClone = [...trace]
	const index = traceClone.shift()
	const part = (index === 0 ? 'den' : 'num')
	return {
		part,
		cursor: General.charElementClickToCursor(evt, value[part], traceClone, charElements[index], equationElement),
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const index = getClosestElement(coordinates, boundsData, false)
	const part = (index === 0 ? 'den' : 'num')
	return {
		part,
		cursor: General.coordinatesToCursor(coordinates, boundsData.parts[index], data.value[part], charElements[index], contentsElement)
	}
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