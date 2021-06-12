import { firstOf } from 'step-wise/util/arrays'

import { addCursor, removeCursor } from '../Input'
import { getClosestElement, charElementsToBounds } from '../MathWithCursor'

import * as General from './index'
import * as Expression from './Expression'
import * as SimpleText from './SimpleText'

const parts = ['sub', 'sup']

export function toLatex(value) {
	const { sub, sup } = value
	const subLatex = sub ? `_{${General.toLatex(sub)}}` : ''
	const supLatex = sup ? `^{${General.toLatex(value.sup)}}` : ''
	return `${subLatex}${supLatex}`
}

export function getLatexChars(value) {
	return parts.map(part => value[part] ? General.getLatexChars(value[part]) : []).filter(array => array.length > 0) // Only add an array for a part that actually exists.
}

export function partToIndex(value, part) {
	return (part === 'sub' || !value.sub) ? 0 : 1
}

export function indexToPart(value, index) {
	return (index === 1 || !value.sub) ? 'sup' : 'sub'
}

export function getCursorProperties(data, charElements, container) {
	const { cursor, value } = data
	return General.getCursorProperties({
		...value[cursor.part],
		cursor: cursor.cursor,
	}, charElements[partToIndex(value, cursor.part)], container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const activeElementData = General.zoomIn(data)

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[partToIndex(value, cursor.part)], topParentData, contentsElement, cursorElement)
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

	// For left/right-arrows, adjust the cursor. Do the same for Backspace/Delete when the cursor is at the end of the respective element.
	if ((key === 'ArrowLeft' || key === 'Backspace') && cursor.part === 'sup' && General.isCursorAtStart(activeElementData) && value.sub)
		return { ...data, cursor: { part: 'sub', cursor: General.getEndCursor(value.sub) } }
	if ((key === 'ArrowRight' || key === 'Delete') && cursor.part === 'sub' && General.isCursorAtEnd(activeElementData) && value.sup)
		return { ...data, cursor: { part: 'sup', cursor: General.getStartCursor(value.sup) } }

	// For up/down arrows, check if we can/need to move up. This is the case if we cannot move up/down inside a child, but we can move up/down here.
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		const up = key === 'ArrowUp'
		if (!General.canMoveCursorVertically(activeElementData, up) && canMoveCursorVertically(data, up)) {
			// Use the current cursor coordinates to get the appropriate cursor position.
			const part = up ? 'sup' : 'sub'
			const partCharElements = charElements[partToIndex(value, part)]
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
		const newValue = value.sup ? value : { ...value, sup: getEmptySup() } // If there is no superscript yet, add an empty one.
		return {
			...data,
			value: newValue,
			cursor: {
				part: 'sup',
				cursor: General.getStartCursor(newValue.sup),
			},
		}
	}

	// Pass on to the appropriate child element.
	return passOn()
}

export function canMoveCursorVertically(data, up) {
	const { value, cursor } = data
	if ((up && cursor.part === 'sub' && value.sup) || (!up && cursor.part === 'sup' && value.sub))
		return true
	return General.canMoveCursorVertically(General.zoomIn(data), up)
}

export function charElementClickToCursor(evt, value, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const traceClone = [...trace]
	const index = traceClone.shift()
	const part = indexToPart(value, index)
	return {
		part,
		cursor: General.charElementClickToCursor(evt, value[part], traceClone, charElements[index], equationElement),
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const { value } = data
	const index = getClosestElement(coordinates, boundsData, false)
	const part = indexToPart(value, index)
	return {
		part,
		cursor: General.coordinatesToCursor(coordinates, boundsData.parts[index], value[part], charElements[index], contentsElement)
	}
}

export function getStartCursor(value) {
	if (!value.sub)
		return { part: 'sup', cursor: General.getStartCursor(value.sup) }
	return { part: 'sub', cursor: General.getStartCursor(value.sub) }
}

export function getEndCursor(value) {
	if (!value.sup)
		return { part: 'sub', cursor: General.getEndCursor(value.sub) }
	return { part: 'sup', cursor: General.getEndCursor(value.sup) }
}

export function isCursorAtStart(value, cursor) {
	return value.sub ?
		(cursor.part === 'sub' && SimpleText.isCursorAtStart(value.sub.value, cursor.cursor)) :
		(cursor.part === 'sup' && Expression.isCursorAtStart(value.sup.value, cursor.cursor))
}

export function isCursorAtEnd(value, cursor) {
	return value.sup ?
		(cursor.part === 'sup' && Expression.isCursorAtEnd(value.sup.value, cursor.cursor)) : (cursor.part === 'sub' && SimpleText.isCursorAtEnd(value.sub.value, cursor.cursor))
}

export function getEmpty(includeSub = true, includeSup = true) {
	return {
		sub: includeSub ? getEmptySub() : null,
		sup: includeSup ? getEmptySup() : null,
	}
}

export function getEmptySub() {
	return { type: 'SimpleText', value: SimpleText.getEmpty() }
}

export function getEmptySup() {
	return { type: 'Expression', value: Expression.getEmpty() }
}

export function isEmpty(value) {
	return (!value.sub || General.isEmpty(value.sub)) && (!value.sup || General.isEmpty(value.sup))
}

export function shouldRemove(value) {
	return parts.every(part => !value[part] || General.isEmpty(value[part]))
}

export function canMerge(value, mergeWithNext, fromOutside) {
	const { sup } = value
	return mergeWithNext && !fromOutside && !!sup && !General.isEmpty(sup) // Only merge when we're at the inside of a non-empty superscript and we want to merge with what's outside.
}

export function merge(expressionValue, partIndex, mergeWithNext) {
	const subSup = expressionValue[partIndex].value

	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind } = Expression.getMergeParts(expressionValue, partIndex, mergeWithNext, true)

	// Set up the new superscript.
	const newSup = Expression.cleanUp({
		...subSup.sup,
		value: [
			...subSup.sup.value, // Take what was in the superscript.
			...toPullIn, // Add what needs to be pulled in.
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
			...toLeaveBehind, // Keep what is left behind in the Expression.
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

export function cleanUp(data) {
	const { value, cursor } = data

	// Clean up the parts individually, keeping track of the cursor.
	const newValue = {}
	let newCursor = null
	parts.forEach(part => {
		newValue[part] = value[part] && General.cleanUp(General.zoomInAt(data, part))
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: newValue[part].cursor }
		else if (newValue[part] && General.isEmpty(newValue[part]))
			newValue[part] = null // Remove the element when we don't need it anymore.
		newValue[part] = removeCursor(newValue[part])
	})

	// Assemble everything.
	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}