import { isNumeric, isLetter, first, last } from '@step-wise/js-utils'

import { getClickSide } from 'util'

import { type as unitFactorType, initialValue as initialUnitFactorValue, isEmpty as isUnitFactorEmpty, getStartCursor as getUnitFactorStartCursor, getEndCursor as getUnitFactorEndCursor, isCursorAtStart as isCursorAtUnitFactorStart, isCursorAtEnd as isCursorAtUnitFactorEnd, isValid as isUnitFactorValid, clean as cleanUnitFactor, functionalize as functionalizeUnitFactor, keyPressToFI as unitFactorKeyPressToFI, mouseClickToCursor as unitFactorMouseClickToCursor, processUnitFactor } from '../UnitFactor'

// Define various trivial objects and functions.
export const type = 'UnitArray'
export const initialValue = [initialUnitFactorValue]
export const isEmpty = value => value.length === 0 || (value.length === 1 && isUnitFactorEmpty(first(value)))
export const getStartCursor = (value, cursor) => ({ part: 0, cursor: getUnitFactorStartCursor(first(value), cursor?.part === 0 ? cursor.cursor : undefined) })
export const getEndCursor = (value, cursor) => ({ part: value.length - 1, cursor: getUnitFactorEndCursor(last(value), cursor?.part === value.length - 1 ? cursor.cursor : undefined) })
export const isCursorAtStart = (value, cursor) => cursor?.part === 0 && isCursorAtUnitFactorStart(first(value), cursor.cursor)
export const isCursorAtEnd = (value, cursor) => cursor?.part === value.length - 1 && isCursorAtUnitFactorEnd(last(value), cursor.cursor)
export const isValid = value => isEmpty(value) || value.every(unitFactor => isUnitFactorValid(unitFactor))
export const clean = value => isEmpty(value) ? undefined : value.map(cleanUnitFactor)
export const functionalize = value => (value || initialValue).map(functionalizeUnitFactor)

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, contentsElement) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI

	// Check where the cursor is currently at.
	const unitFactor = value[cursor.part]
	const unitFactorCursor = cursor.cursor

	// Set up a pass-on function.
	const identity = () => {
		const oldUnitFactorFI = {
			type: unitFactorType,
			value: unitFactor,
			cursor: unitFactorCursor,
		}
		const newUnitFactorFI = unitFactorKeyPressToFI(keyInfo, oldUnitFactorFI, contentsElement)
		return {
			...FI,
			value: value.toSpliced(cursor.part, 1, newUnitFactorFI.value),
			cursor: {
				part: cursor.part,
				cursor: newUnitFactorFI.cursor,
			}
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return FI

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		if (cursor.part > 0 && isCursorAtUnitFactorStart(unitFactor, unitFactorCursor)) // Cursor is at the start of an element.
			return { ...FI, cursor: { part: cursor.part - 1, cursor: getUnitFactorEndCursor(value[cursor.part - 1]) } } // Move to the end of the previous one.
	}
	if (key === 'ArrowRight') {
		if (isCursorAtUnitFactorEnd(unitFactor, unitFactorCursor)) {
			if (cursor.part < value.length - 1) // Is there still another unit factor? If so, go there.
				return { ...FI, cursor: { part: cursor.part + 1, cursor: getUnitFactorStartCursor(value[cursor.part + 1]) } }
		}
	}
	if (key === 'Home')
		return { ...FI, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...FI, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, potentially merge unit factors.
	if (key === 'Backspace') {
		if (!isCursorAtStart(value, cursor) && isCursorAtUnitFactorStart(unitFactor, unitFactorCursor)) // Cursor is at start of a unit factor, but not the first.
			return { ...FI, ...mergeElements(value, cursor.part - 1, false) } // Merge it with the previous element.
	}
	if (key === 'Delete') {
		if (!isCursorAtEnd(value, cursor) && isCursorAtUnitFactorEnd(unitFactor, unitFactorCursor)) // Cursor is at end of unit factor, but not the last.
			return { ...FI, ...mergeElements(value, cursor.part, true) } // Merge it with the next element.
	}

	// For a multiplication "*" (or a space) split up elements.
	if (key === '*' || key === 'Times' || key === '.' || key === ' ' || key === 'Spacebar') {
		if (!isUnitFactorEmpty(unitFactor) && !isCursorAtUnitFactorStart(unitFactor, unitFactorCursor)) { // Cursor is not in an empty element or at the start of the element. This prevents endless rows of multiplications.
			if (unitFactorCursor.part === 'power' || unitFactorCursor.cursor === unitFactor.prefix.length + unitFactor.unit.length) { // The cursor is in the power or at the end of the text.
				const nextUnitFactor = value[cursor.part + 1]
				if (nextUnitFactor && isUnitFactorEmpty(nextUnitFactor)) // If the next element is empty, just go there without changing anything.
					return {
						...FI,
						cursor: { part: cursor.part + 1, cursor: getUnitFactorStartCursor(nextUnitFactor) },
					}
				return { // Add a new empty element and move the cursor to it.
					...FI,
					value: value.toSpliced(cursor.part + 1, 0, functionalizeUnitFactor(initialUnitFactorValue)),
					cursor: { part: cursor.part + 1, cursor: getUnitFactorStartCursor() },
				}
			}
			return { // Split the unit factor up into two.
				...FI,
				value: splitElement(value, cursor),
				cursor: { part: cursor.part + 1, cursor: { part: 'text', cursor: 0 } },
			}
		}
	}

	// For letters, if we're in the power (but not the start), add a new unit factor with the pressed letter, with the power split accordingly.
	if (isLetter(key)) {
		if (unitFactorCursor.part === 'power' && unitFactorCursor.cursor > 0) {
			const element1 = { ...unitFactor, power: unitFactor.power.slice(0, unitFactorCursor.cursor) }
			const element2 = processUnitFactor({ text: key, power: unitFactor.power.slice(unitFactorCursor.cursor) }).value
			return {
				...FI,
				value: value.toSpliced(cursor.part, 1, element1, element2),
				cursor: { part: cursor.part + 1, cursor: { part: 'text', cursor: element2.prefix.length + element2.unit.length } },
			}
		}
	}

	// For numbers or power symbols, if the cursor is in the text, split the unit factor.
	if (isNumeric(key) || key === '^' || key === 'Power') {
		if (unitFactorCursor.part === 'text') {
			if (unitFactorCursor.cursor === 0 && unitFactor.prefix.length + unitFactor.unit.length > 0) // If the cursor is at the start of a unit factor with text, do nothing. Don't pass on.
				return { ...FI }
			if (unitFactorCursor.cursor < unitFactor.prefix.length + unitFactor.unit.length) {
				const toAdd = isNumeric(key) ? key : ''
				return {
					...FI,
					value: splitElement(value, cursor, toAdd),
					cursor: { part: cursor.part, cursor: { part: 'power', cursor: toAdd.length } },
				} // Split the unit factor up into two.
			}
		}
	}

	// Unknown key. Try to pass it on.
	return identity()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, FI, unitArrayElement) {
	const { value, cursor } = FI

	// If we clicked on whitespace around the unit array, put the cursor on the start/end.
	if (evt.target === unitArrayElement)
		return getClickSide(evt) === 0 ? getStartCursor(value, cursor) : getEndCursor(value, cursor)

	// If we clicked on a unit factor, pass on the call.
	const unitFactorElements = [...unitArrayElement.getElementsByClassName('unitFactor')]
	const unitFactorIndex = unitFactorElements.findIndex(unitFactorElement => unitFactorElement.contains(evt.target))
	if (unitFactorIndex !== -1) {
		const unitFactorFI = { type: unitFactorType, value: value[unitFactorIndex], cursor: cursor?.part === unitFactorIndex ? cursor.cursor : undefined }
		const newCursor = unitFactorMouseClickToCursor(evt, unitFactorFI, unitFactorElements[unitFactorIndex])
		return newCursor === undefined ? undefined : { part: unitFactorIndex, cursor: newCursor }
	}

	// If we clicked on a times symbol, find the nearest unit factor.
	const timesElements = [...unitArrayElement.getElementsByClassName('times')]
	const timesIndex = timesElements.findIndex(timesElement => timesElement.contains(evt.target))
	if (timesIndex !== -1) {
		const side = getClickSide(evt)
		const part = timesIndex + side
		const unitFactor = value[part]
		return {
			part,
			cursor: side === 0 ? getUnitFactorEndCursor(unitFactor) : getUnitFactorStartCursor(unitFactor),
		}
	}

	// We shouldn't get here, but if we do just keep the cursor as is.
	return cursor
}

// mergeElements takes a unitArray and merges two unit factors together at the given index. (The index points to the first of the two.) When the first unit doesn't have a power or the second unit doesn't have a text, everything can be merged smoothly. If not, either the left power is cut (default) or the right text is cut (when cutRight set to true). The cursor is put in-between as much as possible. It returns an object of the form { value, cursor }.
export function mergeElements(unitArray, index, cutRight = false) {
	// Extract two subsequent unit array elements and merge them, returning the new unit array and the corresponding cursor.
	const a = unitArray[index]
	const b = unitArray[index + 1]

	// Cut away the text of the right element?
	if ((b.prefix === '' && b.unit === '') || (cutRight && a.power !== '')) {
		const unitFactor = { ...a, power: a.power + b.power }
		const unitFactorCursor = a.power === '' ? { part: 'text', cursor: a.prefix.length + a.unit.length } : { part: 'power', cursor: a.power.length }
		return {
			value: unitArray.toSpliced(index, 2, unitFactor),
			cursor: { part: index, cursor: unitFactorCursor },
		}
	}

	// Cut away the power of the left element.
	const { value: unitFactor, cursor: unitFactorCursor } = processUnitFactor({ text: a.prefix + a.unit + b.prefix + b.unit, power: b.power }, { part: 'text', cursor: a.prefix.length + a.unit.length })
	return {
		value: unitArray.toSpliced(index, 2, unitFactor),
		cursor: { part: index, cursor: unitFactorCursor },
	}
}

// splitElement takes a unit array and a cursor object and splits the element at the position of the cursor. It returns a new unit array. A newPower string can be given as the new power of the leftmost of the two elements.
export function splitElement(unitArray, cursor, newPower = '') {
	const unitFactor = unitArray[cursor.part]
	const unitFactorCursor = cursor.cursor
	return unitArray.toSpliced(cursor.part, 1,
		processUnitFactor({ text: (unitFactor.prefix + unitFactor.unit).slice(0, unitFactorCursor.cursor), power: newPower }).value,
		processUnitFactor({ text: (unitFactor.prefix + unitFactor.unit).slice(unitFactorCursor.cursor), power: unitFactor.power }).value,
	)
}

// getCursorFromOffset takes a unit array displayed in a field and finds the position the cursor should have given the offset x-coordinate.
export function getCursorFromOffset(unitArray, unitArrayField, offset) {
	// Find the unit factor which the cursor is closest to.
	const unitFactorFields = [...unitArrayField.getElementsByClassName('unitFactor')]
	const closestFieldIndex = unitFactorFields.reduce(closestFieldReducer, { offset }).index
	const unitFactor = unitArray[closestFieldIndex]
	const unitFactorField = unitFactorFields[closestFieldIndex]

	// Find the character closest to the cursor.
	const charFields = [...unitFactorField.getElementsByClassName('char')]
	const closestCharFieldIndex = charFields.reduce(closestFieldReducer, { offset }).index
	const charField = charFields[closestCharFieldIndex]

	// Find if we're closer to the left or the right of the character. Also check if the character is in the text or the power of the unit factor. Use that to determine the cursor position.
	const textLength = unitFactor.prefix.length + unitFactor.unit.length
	const side = (Math.abs(charField.offsetLeft - offset) < Math.abs(charField.offsetLeft + charField.offsetWidth - offset) ? 0 : 1) // 0 means left, 1 means right.
	const numFillers = unitFactorField.getElementsByClassName('filler').length
	if (closestCharFieldIndex < textLength + numFillers)
		return { part: closestFieldIndex, cursor: { part: 'text', cursor: Math.min(closestCharFieldIndex + side, textLength) } }
	return { part: closestFieldIndex, cursor: { part: 'power', cursor: closestCharFieldIndex + side - (numFillers + textLength) } }
}

// closestFieldReducer is a function used by the getCursorFromOffset function to find the nearest field to an offset position.
function closestFieldReducer(optimum, unitFactorField, index) {
	// Check the distance from the given field to the offset (which is hidden inside the optimum object). If it's closer than the previous optimum, return a new optimum object.
	const offset = optimum.offset
	const distance = Math.min(Math.abs(unitFactorField.offsetLeft - offset), Math.abs(unitFactorField.offsetLeft + unitFactorField.offsetWidth - offset))
	if (optimum.index === undefined || distance < optimum.distance)
		return { index, distance, offset } // New optimum found.
	return optimum // Keep the old optimum.
}
