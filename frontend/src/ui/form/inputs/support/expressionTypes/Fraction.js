import { firstOf } from 'step-wise/util/arrays'

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
	const activeElementData = General.zoomIn(data)

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

		// We can move in the right direction. Use the current cursor coordinates to get the appropriate cursor position.
		const part = up ? 'num' : 'den'
		const partCharElements = charElements[part === 'den' ? 0 : 1]
		const boundsData = charElementsToBounds(partCharElements)
		const cursorRect = cursorElement.getBoundingClientRect()
		const cursorMiddle = { x: (cursorRect.left + cursorRect.right) / 2, y: (cursorRect.top + cursorRect.bottom) / 2 }
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
	const { cursor } = data
	if ((up && cursor.part === 'den') || (!up && cursor.part === 'num'))
		return true
	return General.canMoveCursorVertically(General.zoomIn(data), up)
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
	return { part: 'num', cursor: General.getStartCursor(value.num) }
}

export function getEndCursor(value) {
	return { part: 'den', cursor: General.getEndCursor(value.den) }
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
	return General.isEmpty(value.num) && General.isEmpty(value.den)
}

export function canMerge() {
	return true
}

export function merge(expressionValue, partIndex, mergeWithNext) {
	const fraction = expressionValue[partIndex].value

	// Should we merge with the next?
	if (mergeWithNext) {
		// Set up the new denominator.
		const newDen = Expression.cleanUp({
			...fraction.den,
			value: [
				...fraction.den.value, // Take what was in the denominator.
				...expressionValue.slice(partIndex + 1), // Add what is after the fraction.
			],
			cursor: Expression.getEndCursor(fraction.den.value), // Put the cursor at the end of the previous denominator.
		})

		// Set up the complete expression.
		return {
			type: 'Expression',
			value: [
				...expressionValue.slice(0, partIndex), // Keep previous elements.
				{ // Extend the fraction.
					...expressionValue[partIndex],
					value: {
						num: fraction.num, // Keep the numerator.
						den: removeCursor(newDen), // Use the new denominator.
					},
				},
			],
			cursor: {
				part: partIndex,
				cursor: {
					part: 'den',
					cursor: newDen.cursor, // Use the cursor of the new denominator.
				},
			},
		}
	}

	// We should merge with the previous. Set up the new numerator.
	const expressionBeforeFraction = expressionValue.slice(0, partIndex)
	const newNum = Expression.cleanUp({
		...fraction.num,
		value: [
			...expressionBeforeFraction, // Add what is before the fraction.
			...fraction.num.value, // Take what was in the numerator.
		],
		cursor: Expression.getEndCursor(expressionBeforeFraction), // Put the cursor at the end of the previous denominator.
	})

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			{ // Extend the fraction.
				...expressionValue[partIndex],
				value: {
					num: removeCursor(newNum), // Use the new numerator.
					den: fraction.den, // Keep the denominator.
				},
			},
			...expressionValue.slice(partIndex + 1), // Keep remaining elements.
		],
		cursor: {
			part: 0,
			cursor: {
				part: 'num',
				cursor: newNum.cursor, // Use the cursor of the new denominator.
			},
		},
	}
}

export function canSplit(data) {
	return true
}

export function split(data) {
	const { value, cursor } = data
	const split = Expression.splitAtCursor(General.zoomIn(data))

	// How to assemble things depends on whether we split up a numerator or denominator.
	if (cursor.part === 'num') {
		const newNum = Expression.cleanUp({
			type: 'Expression',
			value: split.right, // Keep the right part of the numerator.
		})
		const newFractionData = {
			type: 'Fraction',
			value: {
				num: newNum,
				den: value.den, // Keep the denominator.
			},
		}
		return {
			type: 'Expression',
			value: [
				...split.left, // Put the left part of the numerator outside of the fraction.
				newFractionData,
			],
			cursor: {
				part: split.left.length,
				cursor: General.getStartCursor(newFractionData),
			},
		}
	} else {
		const newDen = Expression.cleanUp({
			type: 'Expression',
			value: split.left, // Keep the left part of the denominator.
		})
		const newFractionData = {
			type: 'Fraction',
			value: {
				num: value.num, // Keep the numerator.
				den: newDen,
			},
		}
		return {
			type: 'Expression',
			value: [
				newFractionData,
				...split.right, // Put the right part of the denominator outside of the fraction.
			],
			cursor: {
				part: 1,
				cursor: General.getStartCursor(firstOf(split.right)),
			},
		}
	}
}