import { isNumber, isLetter, applyMapping, passOn } from 'step-wise/util'

import { units } from 'step-wise/inputTypes/Unit/units'
import { prefixes } from 'step-wise/inputTypes/Unit/prefixes'

import { getClickSide } from 'util/dom'

import { type as floatType, keyboardSettings as floatKeyboardSettings, keyPressToFI as floatKeyPressToFI, mouseClickToCursor as floatMouseClickToCursor, isEmpty as isFloatEmpty, getStartCursor as getFloatStartCursor, getEndCursor as getFloatEndCursor, isCursorAtStart as isCursorAtFloatStart, isCursorAtEnd as isCursorAtFloatEnd, isValid as isFloatValid, clean as cleanFloat, functionalize as functionalizeFloat, errorToMessage as floatErrorToMessage } from '../FloatInput'
import { type as unitType, keyboardSettings as unitKeyboardSettings, keyPressToFI as unitKeyPressToFI, mouseClickToCursor as unitMouseClickToCursor, isEmpty as isUnitEmpty, getStartCursor as getUnitStartCursor, getEndCursor as getUnitEndCursor, isCursorAtStart as isCursorAtUnitStart, isCursorAtEnd as isCursorAtUnitEnd, isValid as isUnitValid, clean as cleanUnit, functionalize as functionalizeUnit, errorToMessage as unitErrorToMessage } from '../UnitInput'

// Define various trivial objects and functions.
export const type = 'FloatUnit'
export const initialValue = {}
export const parts = ['float', 'unit']
export const isEmpty = ({ float, unit }) => isFloatEmpty(float) && isUnitEmpty(unit)
export const isUnitVisible = ({ unit }, cursor) => !isUnitEmpty(unit) || (cursor && cursor.part === 'unit')
export const getStartCursor = (value, cursor) => ({ part: 'float', cursor: getFloatStartCursor(value.float, cursor && cursor.part === 'float' && cursor.cursor) })
export const getEndCursor = (value, cursor) => {
	const part = isUnitVisible(value, cursor) ? 'unit' : 'float'
	const partCursor = (part === 'float' ? getFloatEndCursor : getUnitEndCursor)(value[part], cursor?.part === part && cursor.cursor)
	return { part, cursor: partCursor }
}
export const isCursorAtStart = ({ float }, cursor) => cursor.part === 'float' && isCursorAtFloatStart(float, cursor.cursor)
export const isCursorAtEnd = (value, cursor) => isUnitVisible(value, cursor) ? (cursor.part === 'unit' && isCursorAtUnitEnd(value.unit, cursor.cursor)) : isCursorAtFloatEnd(value.float, cursor.cursor)
export const isValid = ({ float, unit }) => isFloatValid(float) && isUnitValid(unit)
export const getFloatFI = ({ value, cursor }) => ({ type: floatType, value: value.float, cursor: cursor && cursor.part === 'float' && cursor.cursor })
export const getUnitFI = ({ value, cursor }) => ({ type: unitType, value: value.unit, cursor: cursor && cursor.part === 'unit' && cursor.cursor })
export const clean = ({ float, unit }) => {
	const result = {
		float: isFloatEmpty(float) ? undefined : cleanFloat(float),
		unit: isUnitEmpty(unit) ? undefined : cleanUnit(unit),
	}
	return applyMapping(result, passOn) // Filter out undefined.
}
export const functionalize = ({ float, unit }) => ({ float: functionalizeFloat(float), unit: functionalizeUnit(unit) })

// keyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function keyboardSettings(FI, positive = false, allowPower = true) {
	const { value, cursor } = FI

	// Find the settings for the individual parts and merge the key settings.
	const floatSettings = floatKeyboardSettings({ value: value.float, cursor: cursor.part === 'float' ? cursor.cursor : null }, positive, allowPower)
	const unitSettings = unitKeyboardSettings({ value: value.unit, cursor: cursor.part === 'unit' ? cursor.cursor : null })
	const keySettings = {
		...floatSettings.keySettings,
		...unitSettings.keySettings,
	}

	// Check out special cases in which key settings need to be adjusted.
	if (cursor.part === 'float') {
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
		tab: cursor.part === 'float' ? 'float' : 'unit',
	}
}

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI
	const { float, unit } = value

	// Check where the cursor is currently at.
	const floatCursor = cursor && cursor.part === 'float' && cursor.cursor
	const unitCursor = cursor && cursor.part === 'unit' && cursor.cursor
	const floatFI = getFloatFI(FI)
	const unitFI = getUnitFI(FI)

	// Set up a pass-on function.
	const passOn = (part = cursor.part, partCursor) => {
		// Check which part to pass it on to.
		let newFI = {}
		if (part === 'float') {
			const oldFloatFI = {
				...floatFI,
				cursor: partCursor || floatFI.cursor,
			}
			newFI = floatKeyPressToFI(keyInfo, oldFloatFI, contentsElement, positive, allowPower)
		}
		if (part === 'unit') {
			const oldUnitFI = {
				...unitFI,
				cursor: partCursor || unitFI.cursor,
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
		// If we're at the start of the unit, move to the end of the float.
		if (cursor.part === 'unit' && isCursorAtUnitStart(unit, unitCursor))
			return { ...FI, cursor: { part: 'float', cursor: getFloatEndCursor(float, floatCursor) } }
	}
	if (key === 'ArrowRight') {
		// If we're at the end of the float, move to the start of the unit, assuming we're not in an empty field.
		if (cursor.part === 'float' && isCursorAtFloatEnd(float, floatCursor) && !isEmpty(value))
			return { ...FI, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}
	if (key === 'Home')
		return { ...FI, cursor: { part: 'float', cursor: getFloatStartCursor(float) } } // Move to the start of the float.
	if (key === 'End') {
		if (isUnitVisible(value, cursor))
			return { ...FI, cursor: { part: 'unit', cursor: getUnitEndCursor(unit) } } // Move to the end of the unit.
		return { ...FI, cursor: { part: 'float', cursor: getFloatEndCursor(float) } } // Move to the end of the float.
	}


	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		// If the cursor is at the start of the unit, move it to the end of the float.
		if (cursor.part === 'unit' && isCursorAtUnitStart(unit, unitCursor))
			return { ...FI, cursor: { part: 'float', cursor: getFloatEndCursor(float, floatCursor) } }
	}
	if (key === 'Delete') {
		// If the cursor is at the end of the float, move it to the start of the unit.
		if (cursor.part === 'float' && isCursorAtFloatEnd(float, floatCursor) && isUnitVisible(value, cursor))
			return { ...FI, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}

	// In case of a space, if we're in the float, move to the start of the unit.
	if (key === ' ' || key === 'Spacebar') {
		if (cursor.part === 'float')
			return { ...FI, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}

	// In case of a letter in the float, process them like we're in the unit. Except if it's an e: this one is processed by the unit.
	if (((isLetter(key) || key === '%' || key === 'Meter' || Object.keys(units).includes(key) || Object.keys(prefixes).includes(key)) && key !== 'e') && cursor.part === 'float')
		return passOn('unit', getUnitStartCursor(unit))

	// In case of a number in the unit, check if we're at the start. If so, pretend we're in the float.
	if (isNumber(key) && cursor.part === 'unit') {
		if (isCursorAtUnitStart(unit, unitCursor))
			return passOn('float', getFloatEndCursor(float))
	}

	// In case of a slash in the float, pretend we're at the start of the unit.
	if (key === '/' && cursor.part === 'float') {
		return passOn('unit', getUnitStartCursor(unit))
	}

	// Pass the call on to the current element.
	return passOn()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(event, FI, contentsElement) {
	const { value, cursor } = FI
	const { float, unit } = value

	// Check on which part was clicked.
	let partElement
	let part = ['float', 'unitSpacer', 'unit'].find(part => {
		partElement = contentsElement.getElementsByClassName(part)[0]
		return partElement && partElement.contains(event.target)
	})

	// Find a new cursor given this part.
	let newCursor
	if (part === 'float') {
		if (event.target.classList.contains('filler'))
			newCursor = getFloatStartCursor(float)
		else
			newCursor = floatMouseClickToCursor(event, getFloatFI(FI), partElement)
	} else if (part === 'unit') {
		newCursor = unitMouseClickToCursor(event, getUnitFI(FI), partElement)
	} else if (part === 'unitSpacer') {
		if (getClickSide(event) === 0) {
			part = 'float'
			newCursor = getFloatEndCursor(float)
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
