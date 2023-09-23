import { lastOf, arraySplice, applyMapping, keysToObject, repeat } from 'step-wise/util'

import { selectRandomInvalidUnit } from 'util/feedbackMessages'

import { type as unitArrayType, initialValue as initialUnitArrayValue, isEmpty as isUnitArrayEmpty, getStartCursor as getUnitArrayStartCursor, getEndCursor as getUnitArrayEndCursor, isCursorAtStart as isCursorAtUnitArrayStart, isCursorAtEnd as isCursorAtUnitArrayEnd, isValid as isUnitArrayValid, mergeElements, splitElement, getCursorFromOffset as getUnitArrayCursorFromOffset, clean as cleanUnitArray, functionalize as functionalizeUnitArray, keyPressToFI as unitArrayKeyPressToFI, mouseClickToCursor as unitArrayMouseClickToCursor } from '../UnitArray'
import { isEmpty as isUnitElementEmpty, getStartCursor as getUnitElementStartCursor, getEndCursor as getUnitElementEndCursor, isCursorAtStart as isCursorAtUnitElementStart } from '../UnitElement'

// Define various trivial objects and functions.
export const type = 'Unit'
export const initialValue = {}
export const parts = ['num', 'den']
export const isEmpty = ({ num, den }) => isUnitArrayEmpty(num) && isUnitArrayEmpty(den)
export const isDenominatorVisible = (value, cursor) => !isUnitArrayEmpty(value.den) || (cursor?.part === 'den')
export const getStartCursor = ({ num }, cursor) => ({ part: 'num', cursor: getUnitArrayStartCursor(num, cursor?.part === 'num' ? cursor.cursor : undefined) })
export const getEndCursor = (value, cursor) => {
	const part = isDenominatorVisible(value, cursor) ? 'den' : 'num'
	return { part, cursor: getUnitArrayEndCursor(value[part], cursor?.part === part ? cursor.cursor : undefined) }
}
export const isCursorAtStart = (value, cursor) => cursor.part === 'num' && isCursorAtUnitArrayStart(value.num, cursor.cursor)
export const isCursorAtEnd = (value, cursor) => isDenominatorVisible(value, cursor) ? (cursor.part === 'den' && isCursorAtUnitArrayEnd(value.den, cursor.cursor)) : (cursor.part === 'num' && isCursorAtUnitArrayEnd(value.num, cursor.cursor))
export const isValid = (value) => parts.every(part => isUnitArrayValid(value[part]))
export const clean = value => applyMapping(value, cleanUnitArray)
export const functionalize = value => keysToObject(parts, part => functionalizeUnitArray((value || initialValue)[part]))

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
			ArrowUp: unitCursor.part === 'den',
			ArrowDown: unitCursor.part === 'num',
			Minus: unitElementCursor.part === 'power',
			Times: !isUnitElementEmpty(unitElement) && !isCursorAtUnitElementStart(unitElement, unitElementCursor),
			Divide: unitCursor.part === 'num' || (unitCursor.part === 'den' && !isCursorAtUnitArrayStart(unitArray, unitArrayCursor)),
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
	const { num, den } = value

	// Check where the cursor is currently at.
	const unitArray = value[cursor.part]
	const unitArrayCursor = cursor.cursor
	const unitElement = unitArray[unitArrayCursor.part]
	const unitElementCursor = unitArrayCursor.cursor

	// Set up a pass-on function.
	const passOn = () => {
		const oldUnitArrayFI = {
			type: unitArrayType,
			value: unitArray,
			cursor: unitArrayCursor,
		}
		const newUnitArrayFI = unitArrayKeyPressToFI(keyInfo, oldUnitArrayFI)
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
		if (cursor.part === 'den' && isCursorAtUnitArrayStart(den, unitArrayCursor))
			return { ...FI, cursor: { part: 'num', cursor: getUnitArrayEndCursor(num) } }
	}
	if (key === 'ArrowRight') {
		// If we're at the end of the numerator, move to the start of the denominator if it exists.
		if (cursor.part === 'num' && isCursorAtUnitArrayEnd(num, unitArrayCursor) && !isUnitArrayEmpty(den))
			return { ...FI, cursor: { part: 'den', cursor: getUnitArrayStartCursor(den) } }
	}
	if (key === 'Home') {
		// If we're at the start of the denominator, move to the start of the numerator. Otherwise move to home within the unit array.
		if (cursor.part === 'den' && isCursorAtUnitArrayStart(den, unitArrayCursor))
			return { ...FI, cursor: { part: 'num', cursor: getUnitArrayStartCursor(num) } }
	}
	if (key === 'End') {
		// If we're at the end of the numerator, move to the end of the denominator. Otherwise move to the end within the unit array.
		if (cursor.part === 'num' && isCursorAtUnitArrayEnd(num, unitArrayCursor) && !isUnitArrayEmpty(den))
			return { ...FI, cursor: { part: 'den', cursor: getUnitArrayEndCursor(den) } }
	}
	if (key === 'ArrowDown' && cursor.part === 'num') {
		// If there is no denominator yet, put the cursor there.
		if (isUnitArrayEmpty(den))
			return { ...FI, cursor: { part: 'den', cursor: getUnitArrayStartCursor(den) } }

		// Find the position of the cursor and use it to determine the new cursor.
		const cursorOffset = contentsElement.getElementsByClassName('cursorContainer')[0].offsetLeft
		return { ...FI, cursor: { part: 'den', cursor: getUnitArrayCursorFromOffset(den, contentsElement.getElementsByClassName('den')[0], cursorOffset) } }
	}
	if (key === 'ArrowUp' && cursor.part === 'den') {
		// If there is no numerator, put the cursor at its start.
		if (isUnitArrayEmpty(num))
			return { ...FI, cursor: { part: 'num', cursor: getUnitArrayStartCursor(num) } }

		// Find the position of the cursor and use it to determine the new cursor.
		const cursorOffset = contentsElement.getElementsByClassName('cursorContainer')[0].offsetLeft
		return { ...FI, cursor: { part: 'num', cursor: getUnitArrayCursorFromOffset(num, contentsElement.getElementsByClassName('num')[0], cursorOffset) } }
	}

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (cursor.part === 'den' && isCursorAtUnitArrayStart(unitArray, unitArrayCursor)) // Cursor is at the start of the denominator.
			return { ...FI, ...mergeNumeratorAndDenominator(value, true) } // Merge the numerator and denominator in the appropriate way.
	}
	if (key === 'Delete') {
		if (cursor.part === 'num' && isCursorAtUnitArrayEnd(unitArray, unitArrayCursor) && isDenominatorVisible(value, cursor)) // Cursor is at the end of the numerator.
			return { ...FI, ...mergeNumeratorAndDenominator(value, false) } // Merge the numerator and denominator in the appropriate way.
	}

	// For the minus sign, if we're in a power, throw the unit to the other unit array.
	if ((key === '-' || key === 'Minus') && unitElementCursor.part === 'power') {
		const partA = cursor.part
		const partB = partA === 'num' ? 'den' : 'num'
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
		const numLength = (isUnitArrayEmpty(num) ? 0 : num.length)
		if (isCursorAtUnitElementStart(unitElement, unitElementCursor)) { // Cursor is at the start.
			// Don't do any preprocessing. Just remember to split before the current unit element.
			unitBeforeSplit = value
			divideAt = cursor.part === 'num' ? unitArrayCursor.part : numLength + unitArrayCursor.part
		} else if (unitElementCursor.part === 'text' && unitElementCursor.cursor < unitElement.prefix.length + unitElement.unit.length) { // Cursor is inside of the text (but not at the start/end).
			// Split the unit element accordingly.
			unitBeforeSplit = {
				...value,
				[cursor.part]: splitElement(unitArray, unitArrayCursor),
			}
			divideAt = cursor.part === 'num' ? unitArrayCursor.part + 1 : numLength + unitArrayCursor.part + 1
		} else { // Cursor is at the end of the text or in the power.
			// Don't do any preprocessing. Just remember to split after the current unit element.
			unitBeforeSplit = value
			divideAt = cursor.part === 'num' ? unitArrayCursor.part + 1 : numLength + unitArrayCursor.part + 1
		}

		// Merge the numerator and denominator together and split it at the right point.
		const mergedUnitArray = [
			...(isUnitArrayEmpty(unitBeforeSplit.num) ? [] : unitBeforeSplit.num),
			...(isUnitArrayEmpty(unitBeforeSplit.den) ? [] : unitBeforeSplit.den),
		]
		const newNum = (divideAt === 0 ? functionalizeUnitArray(initialUnitArrayValue) : mergedUnitArray.slice(0, divideAt))
		const newDen = (divideAt === mergedUnitArray.length ? functionalizeUnitArray(initialUnitArrayValue) : mergedUnitArray.slice(divideAt))
		return {
			...FI,
			value: { num: newNum, den: newDen },
			cursor: { part: 'den', cursor: getUnitArrayStartCursor(newDen) },
		}
	}

	// Unknown key. Try to pass it on.
	return passOn()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, FI, contentsElement) {
	const { value, cursor } = FI

	// Check on which part was clicked.
	let unitArrayElement
	const part = ['num', 'den'].find(part => {
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
	const { num, den } = value
	let newNumerator = [...num, ...den]
	let newNumeratorCursor = putCursorOnTheRight ?
		{ part: num.length, cursor: getUnitElementStartCursor(den[0]) } :
		{ part: num.length - 1, cursor: getUnitElementEndCursor(lastOf(num)) }

	// Check if a merger is needed and if so execute it.
	if (lastOf(num).power === '' || den[0].text === '') {
		const merger = mergeElements(newNumerator, num.length - 1)
		newNumerator = merger.value
		newNumeratorCursor = merger.cursor
	}

	// Return the result.
	return {
		value: { num: newNumerator, den: functionalizeUnitArray(initialUnitArrayValue) },
		cursor: { part: 'num', cursor: newNumeratorCursor },
	}
}

// errorToMessage turns an error during interpretation into a message to be displayed.
export function errorToMessage(error) {
	switch (error.code) {
		case 'InvalidUnit': return selectRandomInvalidUnit()
		default: return
	}
}
