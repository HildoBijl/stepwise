import { isNumber, removeAt, insertAt, isLetter, keysToObject } from 'step-wise/util'
import { units, prefixes, interpretPrefixAndBaseUnitStr } from 'step-wise/inputTypes'

import { getClickPosition } from '../../TextInput'

// Define various trivial objects and functions.
export const type = 'UnitElement'
export const initialValue = {}
export const parts = ['prefix', 'unit', 'power']
export const isEmpty = value => value.prefix === '' && value.unit === '' && value.power === ''
export const hasPowerVisible = ({ power }, cursor) => (power !== '' || (cursor?.part === 'power'))
export const getStartCursor = () => ({ part: 'text', cursor: 0 })
export const getEndCursor = (FI, cursor) => hasPowerVisible(FI, cursor) ? { part: 'power', cursor: FI.power.length } : { part: 'text', cursor: FI.prefix.length + FI.unit.length }
export const isCursorAtStart = (_, cursor) => cursor?.part === 'text' && cursor.cursor === 0
export const isCursorAtEnd = ({ prefix, unit, power }, cursor) => (cursor?.part === 'power' && cursor.cursor === power.length) || (power === '' && cursor?.cursor === prefix.length + unit.length)
export const isValid = value => value.unitObj && (value.prefix === '' || !!value.prefixObj)
export const clean = value => isEmpty(value) ? undefined : keysToObject(parts, part => value[part] || undefined)
export const functionalize = ({ prefix = '', unit = '', power = '' }) => processUnitElement({ text: prefix + unit, power }).value

// keyPressToFI takes a keyInfo event and an FI object and returns a new FI object.
export function keyPressToFI(keyInfo, FI, contentsElement) {
	// Let's walk through a large variety of cases and see what's up.
	let { key, ctrl, alt } = keyInfo
	const { value, cursor } = FI
	const { prefix, unit, power } = value

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return FI

	// The meter key counts as an m.
	if (key === 'Meter')
		key = 'm'

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		if (cursor.part === 'power' && cursor.cursor === 0) // Cursor is at the start of the power.
			return { ...FI, cursor: { part: 'text', cursor: prefix.length + unit.length } } // Move to the end of the text.
		return { ...FI, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Move one position to the left.
	}
	if (key === 'ArrowRight') {
		if (cursor.part === 'text' && cursor.cursor === prefix.length + unit.length && power !== '') // Cursor is at the end of the text and there is a power.
			return { ...FI, cursor: { part: 'power', cursor: 0 } } // Move to the start of said power.
		return { ...FI, cursor: { ...cursor, cursor: Math.min(cursor.cursor + 1, cursor.part === 'text' ? prefix.length + unit.length : power.length) } } // Move the cursor one position to the right.
	}
	if (key === 'Home')
		return { ...FI, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...FI, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor)) // Cursor is at the start of the text.
			return FI // Do nothing.
		if (cursor.part === 'power') { // Cursor is in the power.
			if (cursor.cursor === 0) // Cursor is at the start of the power.
				return { ...FI, ...processUnitElement({ text: removeAt(prefix + unit, prefix.length + unit.length - 1), power }, { part: 'text', cursor: Math.max(prefix.length + unit.length - 1, 0) }) } // Remove the last character of the text.
			return { ...FI, value: { ...value, power: removeAt(power, cursor.cursor - 1) }, cursor: { ...cursor, cursor: cursor.cursor - 1 } } // Remove the previous character from the power.
		}
		return { ...FI, ...processUnitElement({ text: removeAt(prefix + unit, cursor.cursor - 1), power }, { ...cursor, cursor: cursor.cursor - 1 }) } // Remove the previous character from the text.
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor)) // Cursor is at the end.
			return FI // Do nothing.
		if (cursor.part === 'text') { // Cursor is in the text.
			if (cursor.cursor === prefix.length + unit.length) // Cursor is at the end of the text.
				return { ...FI, value: { ...value, power: removeAt(power, 0) }, cursor: { part: 'power', cursor: 0 } } // Remove the first character from the power.
			return { ...FI, ...processUnitElement({ text: removeAt(prefix + unit, cursor.cursor), power }, cursor) } // Remove the upcoming character from the text.
		}
		return { ...FI, value: { ...value, [cursor.part]: removeAt(power, cursor.cursor) } } // Remove the upcoming character from the power.
	}

	// For a power symbol move the cursor to the start of the power.
	if ((key === '^' || key === 'Power') && cursor.part === 'text') {
		return { ...FI, cursor: { part: 'power', cursor: 0 } }
	}

	// For letters and base units add them to the unit.
	if (isLetter(key) || Object.keys(units).includes(key) || Object.keys(prefixes).includes(key)) {
		const addAt = cursor.part === 'text' ? cursor.cursor : prefix.length + unit.length
		return { ...FI, ...processUnitElement({ text: insertAt(prefix + unit, addAt, key), power }, { part: 'text', cursor: addAt + key.length }) }
	}

	// For numbers add them to the power.
	if (isNumber(key)) {
		const addAt = cursor.part === 'power' ? cursor.cursor : 0
		return { ...FI, value: { ...value, power: insertAt(power, addAt, key) }, cursor: { part: 'power', cursor: addAt + 1 } }
	}

	// Nothing sensible found. Don't make any changes.
	return FI
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, FI, unitElementElement) {
	const { value, cursor } = FI

	// Did we click on a filler?
	const fillers = [...unitElementElement.getElementsByClassName('filler')]
	if (fillers.some(filler => filler.contains(evt.target)))
		return getStartCursor()

	// Did we click on the prefix element?
	const prefixElement = unitElementElement.getElementsByClassName('prefix')[0]
	if (prefixElement && prefixElement.contains(evt.target))
		return { part: 'text', cursor: getClickPosition(evt, prefixElement) }

	// Was it the unit element?
	const unitElement = unitElementElement.getElementsByClassName('baseUnit')[0]
	if (unitElement && unitElement.contains(evt.target))
		return { part: 'text', cursor: value.prefix.length + getClickPosition(evt, unitElement) }

	// Was it the power symbol?
	const powerElement = unitElementElement.getElementsByClassName('power')[0]
	if (powerElement && powerElement.contains(evt.target))
		return { part: 'power', cursor: getClickPosition(evt, powerElement) }

	// Most likely we never get here. Just in case, keep the cursor as it.
	return cursor
}

// processUnitElement takes a simple unit element value of the form { text: 'kOhm', power: '2' } and optionally also a cursor { part: 'text', cursor: 4 }. It processes it into an object that can be displayed. So you get { value: { prefix: 'k', unit: 'Ω', power: '2', prefixObj: {obj}, unitObj: {obj} }, cursor: { part: 'text', cursor: 2 } }. If found, the references to the prefix and unit objects are also added.
export function processUnitElement(value, cursor) {
	const { text, power } = value
	const { prefix, unit } = interpretPrefixAndBaseUnitStr(text)

	// Determine if the cursor needs to shift.
	if (cursor?.part === 'text') {
		if (cursor.cursor > 0 && cursor.cursor <= prefix.original.length) { // Was the cursor in the prefix?
			if (prefix.original.length !== prefix.str.length) // Did the prefix length change?
				cursor = { ...cursor, cursor: prefix.str.length } // Put the cursor at the end of the adjusted part.
		} else if (cursor.cursor > prefix.original.length) { // The cursor was in the unit.
			if (unit.original.length !== unit.str.length) // Did the unit length change?
				cursor = { ...cursor, cursor: prefix.str.length + unit.str.length } // Put the cursor at the end of the adjusted part.
			else if (prefix.original.length !== prefix.str.length) // Did the prefix length change?
				cursor = { ...cursor, cursor: cursor.cursor - (prefix.original.length - prefix.str.length) } // Shift the cursor to the left by how much the prefix shortened.
		}
	}

	// Return the required FI.
	const processedValue = {
		prefix: prefix.str,
		unit: unit.str,
		power,
	}
	if (prefix.obj)
		processedValue.prefixObj = prefix.obj
	if (unit.obj)
		processedValue.unitObj = unit.obj
	return {
		value: processedValue,
		cursor,
	}
}
