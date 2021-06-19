import { firstOf, lastOf, arraySplice } from 'step-wise/util/arrays'

import { addCursor, removeCursor } from '../../Input'
import { getClosestElement } from '../../MathWithCursor'

import * as General from '../index'
import * as Expression from '../Expression'

import * as sqrt from './sqrt'
import * as log from './log'

const functions = {
	sqrt,
	log,
}
export { functions }

export function create(expressionData, part, position, name, alias) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[name].create
	if (functionOfType)
		return functionOfType(expressionData, part, position, name, alias)

	// Apply the default procedure. First set up the new value.
	console.log('Creating for ' + alias)
	const { value, cursor } = expressionData
	const expressionPartValue = value[part].value
	const newValue = [
		...value.slice(0, part),
		{ type: 'ExpressionPart', value: expressionPartValue.substring(0, position) },
		{ type: 'Function', name, alias, value: getEmpty(name, alias) },
		{ type: 'ExpressionPart', value: expressionPartValue.substring(position + alias.length) },
		...value.slice(part + 1),
	]

	// Then figure out where we need to put the cursor.
	let newCursor
	if (!cursor)
		newCursor = null
	else if (cursor.part < part)
		newCursor = cursor // Keep it where it is.
	else if (cursor.part > part)
		newCursor = { part: cursor.part + 2, cursor: cursor.cursor } // Keep it where it is, but two parts have been added prior to it.
	else
		newCursor = { part: cursor.part + 2, cursor: 0 } // Move right after the new function.

	return {
		...expressionData,
		value: newValue,
		cursor: newCursor,
	}
}

export function toLatex(data, options) {
	return {
		type: 'LatexWithChars',
		...functions[data.name].toLatex(data, options),
	}
}

export function getCursorProperties(data, charElements, container) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[data.name].getCursorProperties
	if (functionOfType)
		return functionOfType(data)

	const { cursor, value } = data
	return General.getCursorProperties({
		...value[cursor.part],
		cursor: cursor.cursor,
	}, charElements[cursor.part], container)
}

export function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[data.name].keyPressToData
	if (functionOfType)
		return functionOfType(data)

	// When we want to pass this on to the child element, we have this custom function.
	const { value, cursor } = data
	const passOn = () => {
		const adjustedElement = General.keyPressToData(keyInfo, addCursor(value[cursor.part], cursor.cursor), charElements[cursor.part], topParentData, contentsElement, cursorElement)
		const newValue = arraySplice(value, cursor.part, 1, removeCursor(adjustedElement))
		return {
			...data,
			value: newValue,
			cursor: { ...cursor, cursor: adjustedElement.cursor },
		}
	}

	// TODO

	// // Ignore ctrl/alt keys.
	// if (ctrl || alt)
	// 	return data

	// // For left/right-arrows, home and end, adjust the cursor.
	// if (key === 'ArrowLeft' && cursor.part === 'den' && General.isCursorAtStart(activeElementData))
	// 	return { ...data, cursor: { part: 'num', cursor: General.getEndCursor(value.num) } } // Move to the end of the numerator.
	// if (key === 'ArrowRight' && cursor.part === 'num' && General.isCursorAtEnd(activeElementData))
	// 	return { ...data, cursor: { part: 'den', cursor: General.getStartCursor(value.den) } } // Move to the start of the denominator.

	// // For up/down arrows, check if we can/need to move up.
	// if (key === 'ArrowUp' || key === 'ArrowDown') {
	// 	const up = key === 'ArrowUp'
	// 	// Can we relegate this to a child? If so, pass it on.
	// 	if (General.canMoveCursorVertically(activeElementData, up))
	// 		return passOn()

	// 	// We cannot relegate it. Can we move up/down here?
	// 	if ((up && cursor.part === 'num') || (!up && cursor.part === 'den'))
	// 		return data // We cannot do this. Don't move the cursor.

	// 	// We can move in the right direction. Use the current cursor coordinates to get the appropriate cursor position.
	// 	const part = up ? 'num' : 'den'
	// 	const partCharElements = charElements[partToIndex(part)]
	// 	const boundsData = charElementsToBounds(partCharElements)
	// 	const cursorRect = cursorElement.getBoundingClientRect()
	// 	const cursorMiddle = { x: (cursorRect.left + cursorRect.right) / 2, y: (cursorRect.top + cursorRect.bottom) / 2 }
	// 	return {
	// 		...data,
	// 		cursor: {
	// 			part,
	// 			cursor: General.coordinatesToCursor(cursorMiddle, boundsData, value[part], partCharElements, contentsElement),
	// 		}
	// 	}
	// }

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
	return General.canMoveCursorVertically(General.zoomIn(data), up)
}

export function charElementClickToCursor(evt, data, trace, charElements, equationElement) {
	const traceClone = [...trace]
	const part = traceClone.shift()
	return {
		part,
		cursor: General.charElementClickToCursor(evt, data.value[part], traceClone, charElements[part], equationElement),
	}
}

export function coordinatesToCursor(coordinates, boundsData, data, charElements, contentsElement) {
	const part = getClosestElement(coordinates, boundsData, false)
	return {
		part,
		cursor: General.coordinatesToCursor(coordinates, boundsData.parts[part], data.value[part], charElements[part], contentsElement)
	}
}

export function getStartCursor(value) {
	return { part: 0, cursor: General.getStartCursor(firstOf(value)) }
}

export function getEndCursor(value) {
	return { part: value.length - 1, cursor: General.getEndCursor(lastOf(value)) }
}

export function isCursorAtStart(value, cursor) {
	return cursor.part === 0 && Expression.isCursorAtStart(firstOf(value).value, cursor.cursor)
}

export function isCursorAtEnd(value, cursor) {
	return cursor.part === value.length - 1 && Expression.isCursorAtEnd(lastOf(value).value, cursor.cursor)
}

export function getEmpty(name) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[name].getEmpty
	if (functionOfType)
		return functionOfType()

	const numParameters = functions[name].numParameters
	return (new Array(numParameters)).fill(0).map(() => ({
		type: 'Expression',
		value: Expression.getEmpty(),
	}))
}

export function isEmpty(value) {
	return value.every(element => General.isEmpty(element))
}

export function shouldRemove(value) {
	return false
}

export function countNetBrackets(data, relativeToCursor) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[data.name].countNetBrackets
	if (functionOfType)
		return functionOfType(data, relativeToCursor)

	// Use the default value.
	return 1 // Assume that it's something like "log(" with an opening bracket.
}

export function canMerge(data, mergeWithNext, fromOutside) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[data.name].canMerge
	if (functionOfType)
		return functionOfType(data, mergeWithNext, fromOutside)

	// Use the default value.
	return false
}

export function merge(data, mergeWithNext, fromOutside) {
	return functions[data.name].merge(data, mergeWithNext, fromOutside) // If a function has specified that it can do this, it will have a function for it.
}

export function canSplit(data) {
	// If the given function has this specified, apply it.
	const functionOfType = functions[data.name].canSplit
	if (functionOfType)
		return functionOfType(data)

	// Use the default value.
	return false
}

export function split(data) {
	return functions[data.name].split(data) // If a function has specified that it can do this, it will have a function for it.
}

export function cleanUp(data) {
	const { value, cursor } = data

	// Clean up the parts individually, keeping track of the cursor.
	let newCursor = null
	const newValue = value.map((_, part) => {
		const newElement = General.cleanUp(General.zoomInAt(data, part))
		if (cursor && cursor.part === part)
			newCursor = { part, cursor: newElement.cursor }
		return removeCursor(newElement)
	})

	// Assemble everything.
	return {
		...data,
		value: newValue,
		cursor: newCursor,
	}
}