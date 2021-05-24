// UnitArray represents a multiplication of unit elements like "km^3 * s^2 * N", but not a division like "m / s". It is not an input field but its functionality is used by other input fields.

import React, { Fragment } from 'react'

import { isNumber } from 'step-wise/util/numbers'
import { isLetter } from 'step-wise/util/strings'
import { lastOf, arraySplice } from 'step-wise/util/arrays'
import { getEmpty as getEmptyUnitElement, isEmpty as isUnitElementEmpty, process as processUnitElement } from 'step-wise/inputTypes/Unit/UnitElement'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Unit/UnitArray'

import { getClickSide } from 'util/dom'

import { checkCursor } from './Input'
import { UnitElement, cursorToKeyboardType as unitElementCursorToKeyboardType, keyPressToData as unitElementKeyPressToData, mouseClickToCursor as unitElementMouseClickToCursor, getStartCursor as getUnitElementStartCursor, getEndCursor as getUnitElementEndCursor, isCursorAtStart as isCursorAtUnitElementStart, isCursorAtEnd as isCursorAtUnitElementEnd } from './UnitElement'

// UnitArray takes an input data object and shows the corresponding contents as JSX render.
export function UnitArray({ type, value, cursor }) {
	// Check input.
	if (type !== 'UnitArray')
		throw new Error(`Invalid type: tried to get the contents of a UnitArray field but got data for a type "${type}" field.`)

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// Iterate over all the unit elements, putting times signs in-between them.
	return value.map((unitElement, index) => (
		<Fragment key={index}>
			{index === 0 ? null : <span className="char times">⋅</span>}
			<UnitElement {...{ type: 'UnitElement', value: unitElement, cursor: cursor && cursor.part === index && cursor.cursor }} />
		</Fragment>
	))
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData() {
	return {
		type: 'UnitArray',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// cursorToKeyboardType takes a cursor object (where is the cursor) and determines which Android keyboard needs to be shown: 'number', 'text' or 'none'.
export function cursorToKeyboardType(cursor) {
	return unitElementCursorToKeyboardType(cursor && cursor.cursor)
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// Check where the cursor is currently at.
	const unitElement = value[cursor.part]
	const unitElementCursor = cursor.cursor

	// Set up a pass-on function.
	const passOn = () => {
		const oldUnitElementData = {
			type: 'UnitElement',
			value: unitElement,
			cursor: unitElementCursor,
		}
		const newUnitElementData = unitElementKeyPressToData(keyInfo, oldUnitElementData)
		return {
			...data,
			value: arraySplice(value, cursor.part, 1, newUnitElementData.value),
			cursor: {
				part: cursor.part,
				cursor: newUnitElementData.cursor,
			}
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		if (cursor.part > 0 && isCursorAtUnitElementStart(unitElement, unitElementCursor)) // Cursor is at the start of an element.
			return { ...data, cursor: { part: cursor.part - 1, cursor: getUnitElementEndCursor(value[cursor.part - 1]) } } // Move to the end of the previous one.
	}
	if (key === 'ArrowRight') {
		if (isCursorAtUnitElementEnd(unitElement, unitElementCursor)) {
			if (cursor.part < value.length - 1) // Is there still another unit element? If so, go there.
				return { ...data, cursor: { part: cursor.part + 1, cursor: getUnitElementStartCursor(value[cursor.part + 1]) } }
			else if (!isUnitElementEmpty(unitElement)) // If not, and if we're not in an empty element, add a new empty element and move the cursor to it.
				return { ...data, value: [...value, getEmptyUnitElement()], cursor: { part: cursor.part + 1, cursor: getUnitElementStartCursor() } }
		}
	}
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, potentially merge unit elements.
	if (key === 'Backspace') {
		if (!isCursorAtStart(value, cursor) && isCursorAtUnitElementStart(unitElement, unitElementCursor)) // Cursor is at start of a unit element, but not the first.
			return { ...data, ...mergeElements(value, cursor.part - 1, false) } // Merge it with the previous element.
	}
	if (key === 'Delete') {
		if (!isCursorAtEnd(value, cursor) && isCursorAtUnitElementEnd(unitElement, unitElementCursor)) // Cursor is at end of unit element, but not the last.
			return { ...data, ...mergeElements(value, cursor.part, true) } // Merge it with the next element.
	}

	// For a multiplication "*" (or a space) split up elements.
	if (key === '*' || key === 'Times' || key === '.' || key === ' ' || key === 'Space') {
		if (!isUnitElementEmpty(unitElement) && !isCursorAtUnitElementStart(unitElement, unitElementCursor)) { // Cursor is not in an empty element or at the start of the element. This prevents endless rows of multiplications.
			if (unitElementCursor.part === 'power' || unitElementCursor.cursor === unitElement.prefix.length + unitElement.unit.length) { // The cursor is in the power or at the end of the text.
				const nextUnitElement = value[cursor.part + 1]
				if (nextUnitElement && isUnitElementEmpty(nextUnitElement)) // If the next element is empty, just go there without changing anything.
					return {
						...data,
						cursor: { part: cursor.part + 1, cursor: getUnitElementStartCursor(nextUnitElement) },
					}
				return { // Add a new empty element and move the cursor to it.
					...data,
					value: arraySplice(value, cursor.part + 1, 0, getEmptyUnitElement()),
					cursor: { part: cursor.part + 1, cursor: getUnitElementStartCursor() },
				}
			}
			return { // Split the unit element up into two.
				...data,
				value: splitElement(value, cursor),
				cursor: { part: cursor.part + 1, cursor: { part: 'text', cursor: 0 } },
			}
		}
	}

	// For letters, if we're in the power (but not the start), add a new unit element with the pressed letter, with the power split accordingly.
	if (isLetter(key)) {
		if (unitElementCursor.part === 'power' && unitElementCursor.cursor > 0) {
			const element1 = { ...unitElement, power: unitElement.power.slice(0, unitElementCursor.cursor) }
			const element2 = processUnitElement({ text: key, power: unitElement.power.slice(unitElementCursor.cursor) }).value
			return {
				...data,
				value: arraySplice(value, cursor.part, 1, element1, element2),
				cursor: { part: cursor.part + 1, cursor: { part: 'text', cursor: element2.prefix.length + element2.unit.length } },
			}
		}
	}

	// For numbers or power symbols, if the cursor is in the text, split the unit element.
	if (isNumber(key) || key === '^' || key === 'Power') {
		if (unitElementCursor.part === 'text') {
			if (unitElementCursor.cursor === 0 && unitElement.prefix.length + unitElement.unit.length > 0) // If the cursor is at the start of a unit element with text, do nothing. Don't pass on.
				return { ...data }
			if (unitElementCursor.cursor < unitElement.prefix.length + unitElement.unit.length) {
				const toAdd = isNumber(key) ? key : ''
				return {
					...data,
					value: splitElement(value, cursor, toAdd),
					cursor: { part: cursor.part, cursor: { part: 'power', cursor: toAdd.length } },
				} // Split the unit element up into two.
			}
		}
	}
	
	// Unknown key. Try to pass it on.
	return passOn()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, unitArrayElement) {
	const { value, cursor } = data

	// If we clicked on whitespace around the unit array, put the cursor on the start/end.
	if (evt.target === unitArrayElement)
		return getClickSide(evt) === 0 ? getStartCursor(value, cursor) : getEndCursor(value, cursor)

	// If we clicked on a unit element, pass on the call.
	const unitElementElements = [...unitArrayElement.getElementsByClassName('unitElement')]
	const unitElementIndex = unitElementElements.findIndex(unitElementElement => unitElementElement.contains(evt.target))
	if (unitElementIndex !== -1) {
		const unitElementData = { type: 'UnitElement', value: value[unitElementIndex], cursor: cursor && cursor.part === unitElementIndex && cursor.cursor }
		const newCursor = unitElementMouseClickToCursor(evt, unitElementData, unitElementElements[unitElementIndex])
		return checkCursor(newCursor) && { part: unitElementIndex, cursor: newCursor }
	}

	// If we clicked on a times symbol, find the nearest unit element.
	const timesElements = [...unitArrayElement.getElementsByClassName('times')]
	const timesIndex = timesElements.findIndex(timesElement => timesElement.contains(evt.target))
	if (timesIndex !== -1) {
		const side = getClickSide(evt)
		const part = timesIndex + side
		const unitElement = value[part]
		return {
			part,
			cursor: side === 0 ? getUnitElementEndCursor(unitElement) : getUnitElementStartCursor(unitElement),
		}
	}

	// We shouldn't get here, but if we do just keep the cursor as is.
	return cursor
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor(value, cursor) {
	const part = 0
	const unitElement = value && value[part]
	const unitElementCursor = cursor && cursor.part === part && cursor.cursor
	return { part, cursor: getUnitElementStartCursor(unitElement, unitElementCursor) }
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value, cursor) {
	const part = value.length - 1
	const unitElement = value[part]
	const unitElementCursor = cursor && cursor.part === part && cursor.cursor
	return { part, cursor: getUnitElementEndCursor(unitElement, unitElementCursor) }
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	return cursor.part === 0 && isCursorAtUnitElementStart(value[0], cursor.cursor)
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	return cursor.part === value.length - 1 && isCursorAtUnitElementEnd(lastOf(value), cursor.cursor)
}

// mergeElements takes a unitArray and merges two unit elements together at the given index. (The index points to the first of the two.) When the first unit doesn't have a power or the second unit doesn't have a text, everything can be merged smoothly. If not, either the left power is cut (default) or the right text is cut (when cutRight set to true). The cursor is put in-between as much as possible. It returns an object of the form { value, cursor }.
export function mergeElements(unitArray, index, cutRight = false) {
	// Extract two subsequent unit array elements and merge them, returning the new unit array and the corresponding cursor.
	const a = unitArray[index]
	const b = unitArray[index + 1]

	// Cut away the text of the right element?
	if ((b.prefix === '' && b.unit === '') || (cutRight && a.power !== '')) {
		const unitElement = { ...a, power: a.power + b.power }
		const unitElementCursor = a.power === '' ? { part: 'text', cursor: a.prefix.length + a.unit.length } : { part: 'power', cursor: a.power.length }
		return {
			value: arraySplice(unitArray, index, 2, unitElement),
			cursor: { part: index, cursor: unitElementCursor },
		}
	}

	// Cut away the power of the left element.
	const { value: unitElement, cursor: unitElementCursor } = processUnitElement({ text: a.prefix + a.unit + b.prefix + b.unit, power: b.power }, { part: 'text', cursor: a.prefix.length + a.unit.length })
	return {
		value: arraySplice(unitArray, index, 2, unitElement),
		cursor: { part: index, cursor: unitElementCursor },
	}
}

// splitElement takes a unit array and a cursor object and splits the element at the position of the cursor. It returns a new unit array. A newPower string can be given as the new power of the leftmost of the two elements.
export function splitElement(unitArray, cursor, newPower = '') {
	const unitElement = unitArray[cursor.part]
	const unitElementCursor = cursor.cursor
	return arraySplice(unitArray, cursor.part, 1,
		processUnitElement({ text: (unitElement.prefix + unitElement.unit).slice(0, unitElementCursor.cursor), power: newPower }).value,
		processUnitElement({ text: (unitElement.prefix + unitElement.unit).slice(unitElementCursor.cursor), power: unitElement.power }).value,
	)
}

// getCursorFromOffset takes a unit array displayed in a field and finds the position the cursor should have given the offset x-coordinate.
export function getCursorFromOffset(unitArray, unitArrayField, offset) {
	// Find the unit element which the cursor is closest to.
	const unitElementFields = [...unitArrayField.getElementsByClassName('unitElement')]
	const closestFieldIndex = unitElementFields.reduce(closestFieldReducer, { offset }).index
	const unitElement = unitArray[closestFieldIndex]
	const unitElementField = unitElementFields[closestFieldIndex]

	// Find the character closest to the cursor.
	const charFields = [...unitElementField.getElementsByClassName('char')]
	const closestCharFieldIndex = charFields.reduce(closestFieldReducer, { offset }).index
	const charField = charFields[closestCharFieldIndex]

	// Find if we're closer to the left or the right of the character. Also check if the character is in the text or the power of the unit element. Use that to determine the cursor position.
	const textLength = unitElement.prefix.length + unitElement.unit.length
	const side = (Math.abs(charField.offsetLeft - offset) < Math.abs(charField.offsetLeft + charField.offsetWidth - offset) ? 0 : 1) // 0 means left, 1 means right.
	const numFillers = unitElementField.getElementsByClassName('filler').length
	if (closestCharFieldIndex < textLength + numFillers)
		return { part: closestFieldIndex, cursor: { part: 'text', cursor: Math.min(closestCharFieldIndex + side, textLength) } }
	return { part: closestFieldIndex, cursor: { part: 'power', cursor: closestCharFieldIndex + side - (numFillers + textLength) } }
}

// closestFieldReducer is a function used by the getCursorFromOffset function to find the nearest field to an offset position.
function closestFieldReducer(optimum, unitElementField, index) {
	// Check the distance from the given field to the offset (which is hidden inside the optimum object). If it's closer than the previous optimum, return a new optimum object.
	const offset = optimum.offset
	const distance = Math.min(Math.abs(unitElementField.offsetLeft - offset), Math.abs(unitElementField.offsetLeft + unitElementField.offsetWidth - offset))
	if (optimum.index === undefined || distance < optimum.distance)
		return { index, distance, offset } // New optimum found.
	return optimum // Keep the old optimum .
}