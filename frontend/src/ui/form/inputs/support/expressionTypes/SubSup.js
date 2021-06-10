import { firstOf } from 'step-wise/util/arrays'

import { addCursor, removeCursor } from '../Input'
import { getClosestElement, charElementsToBounds } from '../MathWithCursor'

import * as General from './index'
import * as Expression from './Expression'
import * as SimpleText from './SimpleText'

export function toLatex(value) {
	return `_{${General.toLatex(value.sub)}}^{${General.toLatex(value.sup)}}`
}

export function getLatexChars(value) {
	return ['sub', 'sup'].map(part => General.getLatexChars(value[part]))
}

export function getCursorProperties(data, charElements, container) {
	const { cursor, value } = data
	return General.getCursorProperties({
		...value[cursor.part],
		cursor: cursor.cursor,
	}, charElements[cursor.part === 'sub' ? 0 : 1], container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const activeElementData = General.zoomIn(data)

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[cursor.part === 'sub' ? 0 : 1], topParentData, contentsElement, cursorElement)
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
	if (key === 'ArrowLeft' && cursor.part === 'sup' && General.isCursorAtStart(activeElementData))
		return { ...data, cursor: { part: 'sub', cursor: General.getEndCursor(value.sub) } }
	if (key === 'ArrowRight' && cursor.part === 'sub' && General.isCursorAtEnd(activeElementData))
		return { ...data, cursor: { part: 'sup', cursor: General.getStartCursor(value.sup) } }

	// For up/down arrows, check if we can/need to move up. This is the case if we cannot move up/down inside a child, but we can move up/down here.
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		const up = key === 'ArrowUp'
		if (!General.canMoveCursorVertically(activeElementData, up) && canMoveCursorVertically(data, up)) {
			// Use the current cursor coordinates to get the appropriate cursor position.
			const part = up ? 'sup' : 'sub'
			const partCharElements = charElements[part === 'sub' ? 0 : 1]
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
	}

	// For a power button when inside the subscript, go to the start of the superscript.
	if ((key === '^' || key === 'Power') && cursor.part === 'sub') {
		return {
			...data,
			cursor: {
				part: 'sup',
				cursor: General.getStartCursor(value.sup),
			},
		}
	}

	// TODO
	// // For backspace/delete check if we should destroy the fraction.
	// if ((key === 'Backspace' && cursor.part === 'den' && General.isCursorAtStart(activeElementData)) || (key === 'Delete' && cursor.part === 'num' && General.isCursorAtEnd(activeElementData))) {
	// 	// Turn it into an expression with the respective parts.
	// 	return Expression.cleanUp({
	// 		type: 'Expression',
	// 		value: [
	// 			value.num, // Plug the numerator in here. The clean-up will spread it out.
	// 			{ type: 'ExpressionPart', value: ExpressionPart.getEmpty() },
	// 			value.den, // Plug the denominator in here. The clean-up will spread it out.
	// 		],
	// 		cursor: {
	// 			part: 1, // In the new ExpressionPart.
	// 			cursor: ExpressionPart.getStartCursor(),
	// 		},
	// 	})
	// }

	// Pass on to the appropriate child element.
	return passOn()
}

export function canMoveCursorVertically(data, up) {
	const { value, cursor } = data
	if ((up && cursor.part === 'sub' && !General.isEmpty(value.sup)) || (!up && cursor.part === 'sup' && !General.isEmpty(value.sub)))
		return true
	return General.canMoveCursorVertically(General.zoomIn(data), up)
}

export function charElementClickToCursor(evt, value, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const traceClone = [...trace]
	const index = traceClone.shift()
	const part = (index === 0 ? 'sub' : 'sup')
	return {
		part,
		cursor: General.charElementClickToCursor(evt, value[part], traceClone, charElements[index], equationElement),
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const index = getClosestElement(coordinates, boundsData, false)
	const part = (index === 0 ? 'sub' : 'sup')
	return {
		part,
		cursor: General.coordinatesToCursor(coordinates, boundsData.parts[index], data.value[part], charElements[index], contentsElement)
	}
}

export function getStartCursor(value) {
	if (General.isEmpty(value.sub) && !General.isEmpty(value.sup))
		return { part: 'sup', cursor: General.getStartCursor(value.sup) }
	return { part: 'sub', cursor: General.getStartCursor(value.sub) }
}

export function getEndCursor(value) {
	if (General.isEmpty(value.sup) && !General.isEmpty(value.sub))
		return { part: 'sub', cursor: General.getEndCursor(value.sub) }
	return { part: 'sup', cursor: General.getEndCursor(value.sup) }
}

export function isCursorAtStart(value, cursor) {
	return (cursor.part === 'sub' && SimpleText.isCursorAtStart(value.sub.value, cursor.cursor)) || (cursor.part === 'sup' && General.isEmpty(value.sub) && Expression.isCursorAtStart(value.sup.value, cursor.cursor))
}

export function isCursorAtEnd(value, cursor) {
	return (cursor.part === 'sup' && Expression.isCursorAtEnd(value.sup.value, cursor.cursor)) || (cursor.part === 'sub' && General.isEmpty(value.sup) && SimpleText.isCursorAtEnd(value.sub.value, cursor.cursor))
}

export function getEmpty() {
	return {
		sub: { type: 'SimpleText', value: SimpleText.getEmpty() },
		sup: { type: 'Expression', value: Expression.getEmpty() },
	}
}

export function isEmpty(value) {
	return General.isEmpty(value.sub) && General.isEmpty(value.sup)
}

export function canMerge(value, mergeWithNext) {
	return mergeWithNext && !General.isEmpty(value.sup)
}

export function merge(expressionValue, partIndex, mergeWithNext) {
	const subSup = expressionValue[partIndex].value

	// Set up the new superscript.
	const newSup = Expression.cleanUp({
		...subSup.sup,
		value: [
			...subSup.sup.value, // Take what was in the superscript.
			...expressionValue.slice(partIndex + 1), // Add what is after the fraction.
		],
		cursor: Expression.getEndCursor(subSup.sup.value), // Put the cursor at the end of the previous superscript.
	})

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex), // Keep previous elements.
			{ // Extend the SubSup.
				...expressionValue[partIndex],
				value: {
					sub: subSup.sub, // Keep the subscript.
					sup: removeCursor(newSup), // Use the new superscript.
				},
			},
		],
		cursor: {
			part: partIndex,
			cursor: {
				part: 'sup',
				cursor: newSup.cursor, // Use the cursor of the new superscript.
			},
		},
	}
}

export function canSplit(data) {
	return data.cursor.part === 'sup' // Can only split the power.
}

export function split(data) {
	const split = Expression.splitAtCursor(General.zoomIn(data))
	const newSup = Expression.cleanUp({
		type: 'Expression',
		value: split.left,
	})
	const newSubSup = {
		type: 'SubSup',
		value: {
			sub: data.value.sub, // Keep the subscript.
			sup: newSup,
		},
	}
	return {
		type: 'Expression',
		value: [
			newSubSup,
			...split.right, // Put the right part of the denominator outside of the fraction.
		],
		cursor: {
			part: 1,
			cursor: General.getStartCursor(firstOf(split.right)),
		},
	}
}