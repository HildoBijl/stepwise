import { isNumeric, isLetter, mapValues, identity } from '@step-wise/js-utils'
import { unitDefinitions, prefixes } from '@step-wise/physics-core'

import { getClickSide } from 'util'

import { type as floatType, keyboardSettings as floatKeyboardSettings, keyPressToFI as floatKeyPressToFI, mouseClickToCursor as floatMouseClickToCursor, isEmpty as isFloatEmpty, getStartCursor as getFloatStartCursor, getEndCursor as getFloatEndCursor, isCursorAtStart as isCursorAtFloatStart, isCursorAtEnd as isCursorAtFloatEnd, isValid as isFloatValid, clean as cleanFloat, functionalize as functionalizeFloat, errorToMessage as floatErrorToMessage } from '../FloatInput'
import { type as unitType, keyboardSettings as unitKeyboardSettings, keyPressToFI as unitKeyPressToFI, mouseClickToCursor as unitMouseClickToCursor, isEmpty as isUnitEmpty, getStartCursor as getUnitStartCursor, getEndCursor as getUnitEndCursor, isCursorAtStart as isCursorAtUnitStart, isCursorAtEnd as isCursorAtUnitEnd, isValid as isUnitValid, clean as cleanUnit, functionalize as functionalizeUnit, errorToMessage as unitErrorToMessage } from '../UnitInput'

// Define various trivial objects and functions.
export const type = 'FloatUnit'
export const initialValue = {}
export const parts = ['value', 'unit']
export const isEmpty = ({ value, unit }) => isFloatEmpty(value) && isUnitEmpty(unit)
export const isUnitVisible = ({ unit }, cursor) => !isUnitEmpty(unit) || (cursor?.part === 'unit')
export const getStartCursor = (value, cursor) => ({ part: 'value', cursor: getFloatStartCursor(value.value, cursor?.part === 'value' ? cursor.cursor : undefined) })
export const getEndCursor = (value, cursor) => {
	const part = isUnitVisible(value, cursor) ? 'unit' : 'value'
	const partCursor = (part === 'value' ? getFloatEndCursor : getUnitEndCursor)(value[part], cursor?.part === part ? cursor.cursor : undefined)
	return { part, cursor: partCursor }
}
export const isCursorAtStart = ({ value }, cursor) => cursor.part === 'value' && isCursorAtFloatStart(value, cursor.cursor)
export const isCursorAtEnd = (value, cursor) => isUnitVisible(value, cursor) ? (cursor.part === 'unit' && isCursorAtUnitEnd(value.unit, cursor.cursor)) : isCursorAtFloatEnd(value.value, cursor.cursor)
export const isValid = ({ value, unit }) => isFloatValid(value) && isUnitValid(unit)
export const getFloatFI = ({ value, cursor }) => ({ type: floatType, value: value.value, cursor: cursor?.part === 'value' ? cursor.cursor : undefined })
export const getUnitFI = ({ value, cursor }) => ({ type: unitType, value: value.unit, cursor: cursor?.part === 'unit' ? cursor.cursor : undefined })
export const clean = ({ value, unit }) => {
	const result = {
		value: isFloatEmpty(value) ? undefined : cleanFloat(value),
		unit: isUnitEmpty(unit) ? undefined : cleanUnit(unit),
	}
	return mapValues(result, identity) // Filter out undefined.
}
export const functionalize = ({ value, unit }) => ({ value: functionalizeFloat(value), unit: functionalizeUnit(unit) })

// keyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function keyboardSettings(FI, positive = false, allowPower = true) {
	const { value, cursor } = FI

	// Find the settings for the individual parts and merge the key settings.
	const floatSettings = floatKeyboardSettings({ value: value.value, cursor: cursor.part === 'value' ? cursor.cursor : null }, positive, allowPower)
	const unitSettings = unitKeyboardSettings({ value: value.unit, cursor: cursor.part === 'unit' ? cursor.cursor : null })
	const keySettings = {
		...floatSettings.keySettings,
		...unitSettings.keySettings,
	}

	// Check out special cases in which key settings need to be adjusted.
	if (cursor.part === 'value') {
		const floatCursor = cursor.cursor
		keySettings.ArrowRight = true
		keySettings.ArrowDown = keySettings.ArrowUp = false
		keySettings.Power = false
		keySettings.Times = floatCursor.part === 'number'
	}
	if (cursor.part === 'unit') {
		keySettings.ArrowLeft = true
		keySettings.Backspace = true
		keySettings.TenPower = false
		keySettings['.'] = false
	}

	// Pass on settings.
	return {
		keySettings,
		float: floatSettings.float,
		unit: unitSettings.unit,
		tab: cursor.part === 'value' ? 'float' : 'unit',
	}
}

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI
	const { value: numericValue, unit } = value

	// Check where the cursor is currently at.
	const floatCursor = cursor?.part === 'value' ? cursor.cursor : undefined
	const unitCursor = cursor?.part === 'unit' ? cursor.cursor : undefined
	const floatFI = getFloatFI(FI)
	const unitFI = getUnitFI(FI)

	// Set up a pass-on function.
	const identity = (part = cursor.part, partCursor) => {
		// Check which part to pass it on to.
		let newFI = {}
		if (part === 'value') {
			const oldFloatFI = {
				...floatFI,
				cursor: partCursor !== undefined ? partCursor : floatFI.cursor,
			}
			newFI = floatKeyPressToFI(keyInfo, oldFloatFI, contentsElement, positive, allowPower)
		}
		if (part === 'unit') {
			const oldUnitFI = {
				...unitFI,
				cursor: partCursor !== undefined ? partCursor : unitFI.cursor,
			}
			newFI = unitKeyPressToFI(keyInfo, oldUnitFI, contentsElement)
		}

		// Merge the resulting FIs.
		return {
			...FI,
			value: {
				...value,
				[part]: newFI.value,
			},
			cursor: {
				part,
				cursor: newFI.cursor,
			}
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return FI

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		// If we're at the start of the unit, move to the end of the value.
		if (cursor.part === 'unit' && isCursorAtUnitStart(unit, unitCursor))
			return { ...FI, cursor: { part: 'value', cursor: getFloatEndCursor(numericValue, floatCursor) } }
	}
	if (key === 'ArrowRight') {
		// If we're at the end of the value, move to the start of the unit, assuming we're not in an empty field.
		if (cursor.part === 'value' && isCursorAtFloatEnd(numericValue, floatCursor) && !isEmpty(value))
			return { ...FI, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}
	if (key === 'Home')
		return { ...FI, cursor: { part: 'value', cursor: getFloatStartCursor(numericValue) } } // Move to the start of the value.
	if (key === 'End') {
		if (isUnitVisible(value, cursor))
			return { ...FI, cursor: { part: 'unit', cursor: getUnitEndCursor(unit) } } // Move to the end of the unit.
		return { ...FI, cursor: { part: 'value', cursor: getFloatEndCursor(numericValue) } } // Move to the end of the value.
	}


	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		// If the cursor is at the start of the unit, move it to the end of the value.
		if (cursor.part === 'unit' && isCursorAtUnitStart(unit, unitCursor))
			return { ...FI, cursor: { part: 'value', cursor: getFloatEndCursor(numericValue, floatCursor) } }
	}
	if (key === 'Delete') {
		// If the cursor is at the end of the value, move it to the start of the unit.
		if (cursor.part === 'value' && isCursorAtFloatEnd(numericValue, floatCursor) && isUnitVisible(value, cursor))
			return { ...FI, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}

	// In case of a space, if we're in the value, move to the start of the unit.
	if (key === ' ' || key === 'Spacebar') {
		if (cursor.part === 'value')
			return { ...FI, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}

	// In case of a symbol in the value, process them like we're in the unit. Except if it's an e: this one is processed by the unit.
	if (((isLetter(key) || key === '%' || key === 'Meter' || Object.keys(unitDefinitions).includes(key) || Object.keys(prefixes).includes(key)) && key !== 'e') && cursor.part === 'value')
		return identity('unit', getUnitStartCursor(unit))

	// In case of a number in the unit, check if we're at the start. If so, pretend we're in the value.
	if (isNumeric(key) && cursor.part === 'unit') {
		if (isCursorAtUnitStart(unit, unitCursor))
			return identity('value', getFloatEndCursor(numericValue))
	}

	// In case of a slash in the value, pretend we're at the start of the unit.
	if (key === '/' && cursor.part === 'value') {
		return identity('unit', getUnitStartCursor(unit))
	}

	// Pass the call on to the current element.
	return identity()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(event, FI, contentsElement) {
	const { value, cursor } = FI
	const { value: numericValue, unit } = value

	// Check on which part was clicked.
	let partElement
	let part = ['value', 'unitSpacer', 'unit'].find(part => {
		partElement = contentsElement.getElementsByClassName(part)[0]
		return partElement && partElement.contains(event.target)
	})

	// Find a new cursor given this part.
	let newCursor
	if (part === 'value') {
		if (event.target.classList.contains('filler'))
			newCursor = getFloatStartCursor(numericValue)
		else
			newCursor = floatMouseClickToCursor(event, getFloatFI(FI), partElement)
	} else if (part === 'unit') {
		newCursor = unitMouseClickToCursor(event, getUnitFI(FI), partElement)
	} else if (part === 'unitSpacer') {
		if (getClickSide(event) === 0) {
			part = 'value'
			newCursor = getFloatEndCursor(numericValue)
		} else {
			part = 'unit'
			newCursor = getUnitStartCursor(unit)
		}
	} else {
		// We shouldn't get here, but if we do just keep the cursor as is.
		part = cursor.part
		newCursor = cursor.cursor
	}
	return newCursor === undefined ? undefined : { part, cursor: newCursor }
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	return floatErrorToMessage(error) || unitErrorToMessage(error)
}
