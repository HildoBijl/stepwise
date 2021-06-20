import { firstOf } from 'step-wise/util/arrays'

import { removeCursor } from '../Input'
import { getClosestElement, charElementsToBounds } from '../MathWithCursor'

import { getFuncs, zoomIn, zoomInAt, getDataStartCursor, getDataEndCursor, isCursorAtDataStart, isCursorAtDataEnd, isDataEmpty } from './index.js'
import Expression from './Expression'
import SimpleText from './SimpleText'
import { getMergeParts } from './support/merging'
import { splitAtCursor } from './support/splitting'

const parts = ['sub', 'sup']

export function toLatex(data, options = {}) {
	const { value } = data
	let latex = ''
	let chars = []
	parts.forEach(part => {
		const element = value[part]
		if (element) {
			const partLatex = getFuncs(element).toLatex(element)
			const preSymbol = part === 'sub' ? '_' : '^'
			latex += `${preSymbol}{${partLatex.latex}}`
			chars.push(partLatex.chars)
		}
	})
	return { latex, chars }
}

export function partToIndex(value, part) {
	return (part === 'sub' || !value.sub) ? 0 : 1
}

export function indexToPart(value, index) {
	return (index === 1 || !value.sub) ? 'sup' : 'sub'
}

export function getCursorProperties(data, charElements, container) {
	const { value, cursor } = data
	const activeElementData = zoomIn(data)
	return getFuncs(activeElementData).getCursorProperties(activeElementData, charElements[partToIndex(value, cursor.part)], container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const activeElementData = zoomIn(data)
	const activeElementFuncs = getFuncs(activeElementData)

	// When we want to pass this on to the child element, we have this custom function.
	const passOn = () => {
		const adjustedElement = activeElementFuncs.keyPressToData(keyInfo, activeElementData, charElements[partToIndex(value, cursor.part)], topParentData, contentsElement, cursorElement)
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
	if ((key === 'ArrowLeft' || key === 'Backspace') && cursor.part === 'sup' && isCursorAtDataStart(activeElementData) && value.sub)
		return { ...data, cursor: { part: 'sub', cursor: getDataEndCursor(value.sub) } }
	if ((key === 'ArrowRight' || key === 'Delete') && cursor.part === 'sub' && isCursorAtDataEnd(activeElementData) && value.sup)
		return { ...data, cursor: { part: 'sup', cursor: getDataStartCursor(value.sup) } }

	// For up/down arrows, check if we can/need to move up. This is the case if we cannot move up/down inside a child, but we can move up/down here.
	if (key === 'ArrowUp' || key === 'ArrowDown') {
		const up = key === 'ArrowUp'
		if (!(activeElementFuncs.canMoveCursorVertically && activeElementFuncs.canMoveCursorVertically(activeElementData, up)) && canMoveCursorVertically(data, up)) {
			// Use the current cursor coordinates to get the appropriate cursor position.
			const part = up ? 'sup' : 'sub'
			const element = value[part]
			const partCharElements = charElements[partToIndex(value, part)]
			const boundsData = charElementsToBounds(partCharElements)
			const cursorRect = cursorElement.getBoundingClientRect()
			const cursorMiddle = { x: (cursorRect.left + cursorRect.right) / 2, y: (cursorRect.top + cursorRect.bottom) / 2 }
			return {
				...data,
				cursor: {
					part,
					cursor: getFuncs(element).coordinatesToCursor(cursorMiddle, boundsData, element, partCharElements, contentsElement),
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
				cursor: getDataStartCursor(newValue.sup),
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
	const activeElementData = zoomIn(data)
	const canMoveCursorVertically = getFuncs(activeElementData).canMoveCursorVertically
	return canMoveCursorVertically ? canMoveCursorVertically(activeElementData, up) : false
}

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	// Pass it on to the respective element.
	const { value } = data
	const index = firstOf(trace)
	const part = indexToPart(value, index)
	const element = value[part]
	const newCursor = getFuncs(element).charElementClickToCursor(evt, element, trace.slice(1), charElements[index], equationElement)
	return newCursor === null ? null : {
		part,
		cursor: newCursor,
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const { value } = data
	const index = getClosestElement(coordinates, boundsData, false)
	const part = indexToPart(value, index)
	const element = value[part]
	return {
		part,
		cursor: getFuncs(element).coordinatesToCursor(coordinates, boundsData.parts[index], element, charElements[index], contentsElement)
	}
}

export function getStartCursor(value) {
	if (!value.sub)
		return { part: 'sup', cursor: getDataStartCursor(value.sup) }
	return { part: 'sub', cursor: getDataStartCursor(value.sub) }
}

export function getEndCursor(value) {
	if (!value.sup)
		return { part: 'sub', cursor: getDataEndCursor(value.sub) }
	return { part: 'sup', cursor: getDataEndCursor(value.sup) }
}

export function isCursorAtStart(value, cursor) {
	const data = { type: 'SubSup', value, cursor }
	return (value.sub ? cursor.part === 'sub' : cursor.part === 'sup') && isCursorAtDataStart(zoomIn(data))
}

export function isCursorAtEnd(value, cursor) {
	const data = { type: 'SubSup', value, cursor }
	return (value.sup ? cursor.part === 'sup' : cursor.part === 'sub') && isCursorAtDataEnd(zoomIn(data))
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
	return (!value.sub || isDataEmpty(value.sub)) && (!value.sup || isDataEmpty(value.sup))
}

export function shouldRemove(data) {
	return parts.every(part => !data.value[part] || isDataEmpty(data.value[part]))
}

export function canMerge(value, mergeWithNext, fromOutside) {
	const { sup } = value
	return mergeWithNext && !fromOutside && !!sup && !isDataEmpty(sup) // Only merge when we're at the inside of a non-empty superscript and we want to merge with what's outside.
}

export function merge(expressionValue, partIndex, mergeWithNext) {
	const subSup = expressionValue[partIndex].value

	// Get the part that needs to be pulled in.
	const { toPullIn, toLeaveBehind } = getMergeParts(expressionValue, partIndex, mergeWithNext, true)

	// Set up the new superscript.
	const newSup = {
		...subSup.sup,
		value: [
			...subSup.sup.value, // Take what was in the superscript.
			...toPullIn, // Add what needs to be pulled in.
		],
	}

	// Set up the complete expression.
	return {
		type: 'Expression',
		value: [
			...expressionValue.slice(0, partIndex), // Keep previous elements.
			{ // Extend the SubSup.
				...expressionValue[partIndex],
				value: {
					sub: subSup.sub, // Keep the subscript.
					sup: newSup, // Use the new superscript.
				},
			},
			...toLeaveBehind, // Keep what is left behind in the Expression.
		],
		cursor: {
			part: partIndex,
			cursor: {
				part: 'sup',
				cursor: Expression.getEndCursor(subSup.sup.value), // Put the cursor at the end of the previous superscript.
			},
		},
	}
}

export function canSplit(data) {
	return data.cursor.part === 'sup' // Can only split the power.
}

export function split(data) {
	const split = splitAtCursor(zoomIn(data))
	const newSup = {
		type: 'Expression',
		value: split.left,
	}
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
			cursor: getDataStartCursor(firstOf(split.right)),
		},
	}
}

export function cleanUp(data) {
	const { cursor } = data

	// Clean up the parts individually, keeping track of the cursor.
	const newValue = {}
	let newCursor = null
	parts.forEach(part => {
		// Clean up the element if we can.
		const element = zoomInAt(data, part)
		if (!element) {
			newValue[part] = element
		} else {
			const cleanUp = getFuncs(element).cleanUp
			newValue[part] = cleanUp ? cleanUp(element) : element
		}

		// Extract the possibly adjusted cursor positions.
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: newValue[part].cursor }
		else if (newValue[part] && isDataEmpty(newValue[part]))
			newValue[part] = null // If the part is empty, and also has no cursor, remove it entirely.
		newValue[part] = removeCursor(newValue[part])
	})

	// Assemble everything.
	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}