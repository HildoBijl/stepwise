import { firstOf } from 'step-wise/util/arrays'

import { addCursor, removeCursor } from '../Input'
import { getClosestElement, charElementsToBounds } from '../MathWithCursor'

import * as General from './index'
import * as ExpressionPart from './ExpressionPart'
import * as Expression from './Expression'

const parts = ['den', 'num'] // Katex puts the denominator first in its HTML rendering, so put that first.

export function toLatex(data, options = {}) {
	const latex = parts.map(part => General.toLatex(data.value[part], options))
	return {
		latex: `\\frac{${latex[partToIndex('num')].latex}}{${latex[partToIndex('den')].latex}}`,
		chars: latex.map(partLatex => partLatex.chars),
	}
}

export function partToIndex(part) {
	return parts.indexOf(part)
}

export function indexToPart(index) {
	return parts[index]
}

export function getCursorProperties(data, charElements, container) {
	const { cursor, value } = data
	return General.getCursorProperties({
		...value[cursor.part],
		cursor: cursor.cursor,
	}, charElements[partToIndex(cursor.part)], container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const activeElementData = General.zoomIn(data)

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[partToIndex(cursor.part)], topParentData, contentsElement, cursorElement)
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
		const partCharElements = charElements[partToIndex(part)]
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

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const { value } = data
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

export function shouldRemove(value) {
	return parts.every(part => General.isEmpty(value[part]))
}

export function canMerge() {
	return true
}

export function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	const fraction = expressionValue[partIndex].value

	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind, cursorAtBreak } = Expression.getMergeParts(expressionValue, partIndex, mergeWithNext, true)

	// If the expression to pull in is empty, and we came from inside, move the cursor outside.
	if (!fromOutside && Expression.isEmpty(toPullIn)) {
		return {
			type: 'Expression',
			value: expressionValue,
			cursor: cursorAtBreak,
		}
	}

	// Should we merge with the next?
	if (mergeWithNext) { // Yes, merge with the next.
		// Set up the new denominator.
		const newDen = Expression.cleanUp({
			...fraction.den,
			value: [
				...fraction.den.value, // Take what was in the denominator.
				...toPullIn, // Add what needs to be pulled in.
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
				...toLeaveBehind, // Keep what is left behind in the Expression.
			],
			cursor: {
				part: partIndex,
				cursor: {
					part: 'den',
					cursor: newDen.cursor, // Use the cursor of the new denominator.
				},
			},
		}
	} else { // We should merge with the previous.
		// Set up the new numerator.
		const newNum = Expression.cleanUp({
			...fraction.num,
			value: [
				...toPullIn, // Add what needs to be pulled in.
				...fraction.num.value, // Take what was in the numerator.
			],
			cursor: Expression.getEndCursor(toPullIn), // Put the cursor at the end of the pulled-in expression.
		})

		// Set up the complete expression.
		return {
			type: 'Expression',
			value: [
				...toLeaveBehind, // Keep what is left behind in the Expression.
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
				part: toLeaveBehind.length,
				cursor: {
					part: 'num',
					cursor: newNum.cursor, // Use the cursor of the new denominator.
				},
			},
		}
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

export function cleanUp(data) {
	const { cursor } = data

	// Clean up the parts individually, keeping track of the cursor.
	const newValue = {}
	let newCursor = null
	parts.forEach(part => {
		newValue[part] = General.cleanUp(General.zoomInAt(data, part))
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: newValue[part].cursor }
		newValue[part] = removeCursor(newValue[part])
	})

	// Assemble everything.
	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}