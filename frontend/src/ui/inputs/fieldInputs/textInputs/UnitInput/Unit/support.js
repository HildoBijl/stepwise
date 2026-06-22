import { last, arraySplice, mapValues, fromKeys, repeat } from '@step-wise/utils'

import { selectRandomInvalidUnit } from '../../../../util'

import { type as unitArrayType, initialValue as initialUnitArrayValue, isEmpty as isUnitArrayEmpty, getStartCursor as getUnitArrayStartCursor, getEndCursor as getUnitArrayEndCursor, isCursorAtStart as isCursorAtUnitArrayStart, isCursorAtEnd as isCursorAtUnitArrayEnd, isValid as isUnitArrayValid, mergeElements, splitElement, getCursorFromOffset as getUnitArrayCursorFromOffset, clean as cleanUnitArray, functionalize as functionalizeUnitArray, keyPressToFI as unitArrayKeyPressToFI, mouseClickToCursor as unitArrayMouseClickToCursor } from '../UnitArray'
import { isEmpty as isUnitElementEmpty, getStartCursor as getUnitElementStartCursor, getEndCursor as getUnitElementEndCursor, isCursorAtStart as isCursorAtUnitElementStart } from '../UnitElement'

// Define various trivial objects and functions.
export const type = 'Unit'
export const initialValue = {}
export const parts = ['numerator', 'denominator']
export const isEmpty = ({ numerator, denominator }) => isUnitArrayEmpty(numerator) && isUnitArrayEmpty(denominator)
export const isDenominatorVisible = (value, cursor) => !isUnitArrayEmpty(value.denominator) || (cursor?.part === 'denominator')
export const getStartCursor = ({ numerator }, cursor) => ({ part: 'numerator', cursor: getUnitArrayStartCursor(numerator, cursor?.part === 'numerator' ? cursor.cursor : undefined) })
export const getEndCursor = (value, cursor) => {
	const part = isDenominatorVisible(value, cursor) ? 'denominator' : 'numerator'
	return { part, cursor: getUnitArrayEndCursor(value[part], cursor?.part === part ? cursor.cursor : undefined) }
}
export const isCursorAtStart = (value, cursor) => cursor.part === 'numerator' && isCursorAtUnitArrayStart(value.numerator, cursor.cursor)
export const isCursorAtEnd = (value, cursor) => isDenominatorVisible(value, cursor) ? (cursor.part === 'denominator' && isCursorAtUnitArrayEnd(value.denominator, cursor.cursor)) : (cursor.part === 'numerator' && isCursorAtUnitArrayEnd(value.numerator, cursor.cursor))
export const isValid = (value) => parts.every(part => isUnitArrayValid(value[part]))
export const clean = value => mapValues(value, cleanUnitArray)
export const functionalize = value => fromKeys(parts, part => functionalizeUnitArray((value || initialValue)[part]))

// FIToKeyboardSettings takes an FI object and determines what keyboard settings are appropriate.
export function keyboardSettings(FI) {
	const { value: unit, cursor: unitCursor } = FI

	let keySettings = {}
	if (unitCursor) {
		// Get the exact cursor position.
		const unitArray = unit[unitCursor.part]
		const unitArrayCursor = unitCursor.cursor
		const unitElement = unitArray[unitArrayCursor.part]
		const unitElementCursor = unitArrayCursor.cursor

		// Determine which keys to disable.
		keySettings = {
			Backspace: !isCursorAtStart(unit, unitCursor),
			ArrowLeft: !isCursorAtStart(unit, unitCursor),
			ArrowRight: !isCursorAtEnd(unit, unitCursor),
			ArrowUp: unitCursor.part === 'denominator',
			ArrowDown: unitCursor.part === 'numerator',
			Minus: unitElementCursor.part === 'power',
			Times: !isUnitElementEmpty(unitElement) && !isCursorAtUnitElementStart(unitElement, unitElementCursor),
			Divide: unitCursor.part === 'numerator' || (unitCursor.part === 'denominator' && !isCursorAtUnitArrayStart(unitArray, unitArrayCursor)),
			Power: unitElementCursor.part === 'text' && !isCursorAtUnitElementStart(unitElement, unitElementCursor),
		}
		if (unitElementCursor.part === 'text' && unitElementCursor.cursor === 0 && unitElement.prefix.length + unitElement.unit.length > 0)
			repeat(10, (index) => keySettings[index] = false)
	}

	// Pass on settings.
	return {
		keySettings,
		unit: {},
		tab: 'unit',
	}
}

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, contentsElement) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI
	const { numerator, denominator } = value

	// Check where the cursor is currently at.
	const unitArray = value[cursor.part]
	const unitArrayCursor = cursor.cursor
	const unitElement = unitArray[unitArrayCursor.part]
	const unitElementCursor = unitArrayCursor.cursor

	// Set up a pass-on function.
	const identity = () => {
		const oldUnitArrayFI = {
			type: unitArrayType,
			value: unitArray,
			cursor: unitArrayCursor,
		}
		const newUnitArrayFI = unitArrayKeyPressToFI(keyInfo, oldUnitArrayFI, contentsElement)
		return {
			...FI,
			value: {
				...value,
				[cursor.part]: newUnitArrayFI.value,
			},
			cursor: {
				part: cursor.part,
				cursor: newUnitArrayFI.cursor,
			}
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return FI

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		// If we're at the start of the denominator, move to the end of the numerator.
		if (cursor.part === 'denominator' && isCursorAtUnitArrayStart(denominator, unitArrayCursor))
			return { ...FI, cursor: { part: 'numerator', cursor: getUnitArrayEndCursor(numerator) } }
	}
	if (key === 'ArrowRight') {
		// If we're at the end of the numerator, move to the start of the denominator if it exists.
		if (cursor.part === 'numerator' && isCursorAtUnitArrayEnd(numerator, unitArrayCursor) && !isUnitArrayEmpty(denominator))
			return { ...FI, cursor: { part: 'denominator', cursor: getUnitArrayStartCursor(denominator) } }
	}
	if (key === 'Home') {
		// If we're at the start of the denominator, move to the start of the numerator. Otherwise move to home within the unit array.
		if (cursor.part === 'denominator' && isCursorAtUnitArrayStart(denominator, unitArrayCursor))
			return { ...FI, cursor: { part: 'numerator', cursor: getUnitArrayStartCursor(numerator) } }
	}
	if (key === 'End') {
		// If we're at the end of the numerator, move to the end of the denominator. Otherwise move to the end within the unit array.
		if (cursor.part === 'numerator' && isCursorAtUnitArrayEnd(numerator, unitArrayCursor) && !isUnitArrayEmpty(denominator))
			return { ...FI, cursor: { part: 'denominator', cursor: getUnitArrayEndCursor(denominator) } }
	}
	if (key === 'ArrowDown' && cursor.part === 'numerator') {
		// If there is no denominator yet, put the cursor there.
		if (isUnitArrayEmpty(denominator))
			return { ...FI, cursor: { part: 'denominator', cursor: getUnitArrayStartCursor(denominator) } }

		// Find the position of the cursor and use it to determine the new cursor.
		const cursorOffset = contentsElement.getElementsByClassName('cursorContainer')[0].offsetLeft
		return { ...FI, cursor: { part: 'denominator', cursor: getUnitArrayCursorFromOffset(denominator, contentsElement.getElementsByClassName('denominator')[0], cursorOffset) } }
	}
	if (key === 'ArrowUp' && cursor.part === 'denominator') {
		// If there is no numerator, put the cursor at its start.
		if (isUnitArrayEmpty(numerator))
			return { ...FI, cursor: { part: 'numerator', cursor: getUnitArrayStartCursor(numerator) } }

		// Find the position of the cursor and use it to determine the new cursor.
		const cursorOffset = contentsElement.getElementsByClassName('cursorContainer')[0].offsetLeft
		return { ...FI, cursor: { part: 'numerator', cursor: getUnitArrayCursorFromOffset(numerator, contentsElement.getElementsByClassName('numerator')[0], cursorOffset) } }
	}

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (cursor.part === 'denominator' && isCursorAtUnitArrayStart(unitArray, unitArrayCursor)) // Cursor is at the start of the denominator.
			return { ...FI, ...mergeNumeratorAndDenominator(value, true) } // Merge the numerator and denominator in the appropriate way.
	}
	if (key === 'Delete') {
		if (cursor.part === 'numerator' && isCursorAtUnitArrayEnd(unitArray, unitArrayCursor) && isDenominatorVisible(value, cursor)) // Cursor is at the end of the numerator.
			return { ...FI, ...mergeNumeratorAndDenominator(value, false) } // Merge the numerator and denominator in the appropriate way.
	}

	// For the minus sign, if we're in a power, throw the unit to the other unit array.
	if ((key === '-' || key === 'Minus') && unitElementCursor.part === 'power') {
		const partA = cursor.part
		const partB = partA === 'numerator' ? 'denominator' : 'numerator'
		const unitArrayA = unitArray.length === 1 ? functionalizeUnitArray(initialUnitArrayValue) : arraySplice(unitArray, unitArrayCursor.part, 1)
		const unitArrayB = isUnitArrayEmpty(value[partB]) ? [unitElement] : [...value[partB], unitElement]
		return {
			...FI,
			value: { [partA]: unitArrayA, [partB]: unitArrayB },
			cursor: { part: partB, cursor: { part: unitArrayB.length - 1, cursor: unitElementCursor } },
		}
	}

	// For the division sign we must split up the fraction at the right place.
	if (key === '/' || key === 'Divide') {
		// Before we split, preprocess the unit and figure out where we will split it.
		let unitBeforeSplit, divideAt
		const numeratorLength = (isUnitArrayEmpty(numerator) ? 0 : numerator.length)
		if (isCursorAtUnitElementStart(unitElement, unitElementCursor)) { // Cursor is at the start.
			// Don't do any preprocessing. Just remember to split before the current unit element.
			unitBeforeSplit = value
			divideAt = cursor.part === 'numerator' ? unitArrayCursor.part : numeratorLength + unitArrayCursor.part
		} else if (unitElementCursor.part === 'text' && unitElementCursor.cursor < unitElement.prefix.length + unitElement.unit.length) { // Cursor is inside of the text (but not at the start/end).
			// Split the unit element accordingly.
			unitBeforeSplit = {
				...value,
				[cursor.part]: splitElement(unitArray, unitArrayCursor),
			}
			divideAt = cursor.part === 'numerator' ? unitArrayCursor.part + 1 : numeratorLength + unitArrayCursor.part + 1
		} else { // Cursor is at the end of the text or in the power.
			// Don't do any preprocessing. Just remember to split after the current unit element.
			unitBeforeSplit = value
			divideAt = cursor.part === 'numerator' ? unitArrayCursor.part + 1 : numeratorLength + unitArrayCursor.part + 1
		}

		// Merge the numerator and denominator together and split it at the right point.
		const mergedUnitArray = [
			...(isUnitArrayEmpty(unitBeforeSplit.numerator) ? [] : unitBeforeSplit.numerator),
			...(isUnitArrayEmpty(unitBeforeSplit.denominator) ? [] : unitBeforeSplit.denominator),
		]
		const newNumerator = (divideAt === 0 ? functionalizeUnitArray(initialUnitArrayValue) : mergedUnitArray.slice(0, divideAt))
		const newDenominator = (divideAt === mergedUnitArray.length ? functionalizeUnitArray(initialUnitArrayValue) : mergedUnitArray.slice(divideAt))
		return {
			...FI,
			value: { numerator: newNumerator, denominator: newDenominator },
			cursor: { part: 'denominator', cursor: getUnitArrayStartCursor(newDenominator) },
		}
	}

	// Unknown key. Try to pass it on.
	return identity()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, FI, contentsElement) {
	const { value, cursor } = FI

	// Check on which part was clicked.
	let unitArrayElement
	const part = ['numerator', 'denominator'].find(part => {
		unitArrayElement = contentsElement.getElementsByClassName(part)[0]
		return unitArrayElement && unitArrayElement.contains(evt.target)
	})
	if (unitArrayElement) {
		const unitArrayFI = { type: unitArrayType, value: value[part], cursor: cursor?.part === part ? cursor.cursor : undefined }
		const newCursor = unitArrayMouseClickToCursor(evt, unitArrayFI, unitArrayElement)
		return newCursor === undefined ? undefined : { part, cursor: newCursor }
	}

	// We shouldn't get here, but if we do just keep the cursor as is.
	return cursor
}

// mergeNumeratorAndDenominator merges the numerator and denominator and puts the cursor in-between. If putCursorOnTheRight is set to false (default true) then the cursor is put at the end of the previous numerator, and otherwise at the start of the previous denominator. It returns an object of the form { value, cursor }.
function mergeNumeratorAndDenominator(value, putCursorOnTheRight = true) {
	// Determine the numerator and the cursor in case we do not merge unit elements.
	const { numerator, denominator } = value
	let newNumerator = [...numerator, ...denominator]
	let newNumeratorCursor = putCursorOnTheRight ?
		{ part: numerator.length, cursor: getUnitElementStartCursor(denominator[0]) } :
		{ part: numerator.length - 1, cursor: getUnitElementEndCursor(last(numerator)) }

	// Check if a merger is needed and if so execute it.
	if (last(numerator).power === '' || denominator[0].text === '') {
		const merger = mergeElements(newNumerator, numerator.length - 1)
		newNumerator = merger.value
		newNumeratorCursor = merger.cursor
	}

	// Return the result.
	return {
		value: { numerator: newNumerator, denominator: functionalizeUnitArray(initialUnitArrayValue) },
		cursor: { part: 'numerator', cursor: newNumeratorCursor },
	}
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	switch (error.code) {
		case 'InvalidUnit': return selectRandomInvalidUnit()
		default: return
	}
}
