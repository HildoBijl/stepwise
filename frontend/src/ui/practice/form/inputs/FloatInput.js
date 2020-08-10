import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { getEmpty, isEmpty, IOtoFO } from 'step-wise/edu/util/inputTypes/Float'
import { isNumber } from 'step-wise/util/numbers'
import { selectRandomEmpty, selectRandomNegative } from 'step-wise/util/random'
import { removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import Input, { getStringJSX, getClickPosition } from './Input'

const useStyles = makeStyles((theme) => ({
	floatInput: {
		'& .tenPowerContainer': {
			// color: theme.palette.info.main,
		},
	},
}))

const defaultProps = {
	placeholder: 'Kommagetal',
	positive: false,
	allowPower: true,
	validate: nonEmpty,
	initialValue: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
	dataToContents,
	cursorToKeyboardType,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
}

export default function FloatInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const allowPower = props.allowPower !== undefined ? props.allowPower : defaultProps.allowPower
	const mergedProps = {
		...defaultProps,
		keyPressToData: (keyInfo, data) => keyPressToData(keyInfo, data, positive, allowPower),
		...props,
		className: clsx(props.className, classes.floatInput, 'floatInput'),
	}

	return <Input {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	// If it's empty note it.
	const { value } = data
	if (isEmpty(value))
		return selectRandomEmpty()

	// If there's only a minus sign or period note it.
	if (value.number === '')
		return 'Je hebt geen getal ingevuld.'
	if (value.number === '-')
		return 'Alleen een min-teken is geen getal.'
	if (value.number === '.')
		return 'Een punt als getal werkt helaas niet.'
	if (value.number === '-.')
		return 'Eh ... wat voor getal is dit?'
}
export function positive(data) {
	// If it's empty note it.
	const nonEmptyValidation = nonEmpty(data)
	if (nonEmptyValidation)
		return nonEmptyValidation

	// If it's negative note it.
	const float = IOtoFO(data.value)
	if (float.number < 0)
		return selectRandomNegative()
}

// dataToContents takes an input data object and shows the corresponding contents as JSX render.
export function dataToContents({ type, value, cursor }) {
	// Check input.
	if (type !== 'Float')
		throw new Error(`Invalid type: tried to get the contents of a Float field but got data for a type "${type}" field.`)

	// Set up the output.
	const { number, power } = value
	const showPower = power !== '' || (cursor && cursor.part === 'power')
	return <>
		<span className="number">
			{getStringJSX(number, cursor && cursor.part === 'number' && cursor.cursor)}
		</span>
		{!showPower ? null : <span className="tenPowerContainer">
			{/* <span className="timesContainer"><span className="times" /></span> */}
			<span className="char times">⋅</span>
			<span className="char ten">10</span>
			<span className="power">
				{getStringJSX(power, cursor && cursor.part === 'power' && cursor.cursor)}
			</span>
		</span>}
	</>
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData() {
	return {
		type: 'Float',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// cursorToKeyboardType takes a cursor object (where is the cursor) and determines which Android keyboard needs to be shown: 'number', 'text' or 'none'.
export function cursorToKeyboardType(cursor) {
	return 'number'
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, positive, allowPower) {
	// Let's walk through a large variety of cases and see what's up.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const { number, power } = value

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For power, multiplication and E keys, move the cursor to the end of the power.
	if (allowPower && (key === '^' || key === '*' || key === 'e' || key === 'E'))
		return { ...data, cursor: { part: 'power', cursor: power.length } }

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		if (cursor.part === 'power' && cursor.cursor === 0)
			return { ...data, cursor: { part: 'number', cursor: number.length } } // Move to the end of the number.
		return { ...data, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Move one position to the left.
	}
	if (key === 'ArrowRight') {
		if (allowPower && cursor.part === 'number' && cursor.cursor === number.length)
			return { ...data, cursor: { part: 'power', cursor: 0 } } // Move to the start of the power.
		return { ...data, cursor: { ...cursor, cursor: Math.min(cursor.cursor + 1, value[cursor.part].length) } } // Move the cursor one position to the right.
	}
	if (key === 'Home')
		return { ...data, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor)) // Cursor is at the start of the number.
			return data // Do nothing.
		if (cursor.part === 'power' && cursor.cursor === 0) // Cursor is at the start of the power.
			return { ...data, value: { ...value, power: '' }, cursor: { part: 'number', cursor: number.length } } // Remove the power.
		return { ...data, value: { ...value, [cursor.part]: removeAtIndex(value[cursor.part], cursor.cursor - 1) }, cursor: { ...cursor, cursor: cursor.cursor - 1 } } // Just remove the previous character.
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor)) // Cursor is at the end.
			return data // Do nothing.
		if (cursor.part === 'number' && cursor.cursor === number.length) // Cursor is at the end of the number.
			return { ...data, value: { ...value, power: '' } } // Remove the power.
		return { ...data, value: { ...value, [cursor.part]: removeAtIndex(value[cursor.part], cursor.cursor) } } // Just remove the upcoming character.
	}

	// For the minus sign, flip the sign of the current part.
	if (key === '-' && (!positive || cursor.part === 'power')) {
		if (value[cursor.part].slice(0, 1) === '-')
			return { ...data, value: { ...value, [cursor.part]: value[cursor.part].slice(1) }, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Remove a minus sign.
		return { ...data, value: { ...value, [cursor.part]: `-${value[cursor.part]}` }, cursor: { ...cursor, cursor: cursor.cursor + 1 } } // Add a minus sign.
	}

	// Check for additions.
	if (isNumber(key)) // Numbers.
		return addStrToData(key, data)

	if (key === '.' || key === ',') { // Period.
		// Don't do anything if we're not in the number part.
		if (cursor.part !== 'number')
			return data // We're not in the number.

		// If there already is a period, remove it first.
		const periodPosition = number.indexOf('.')
		if (periodPosition !== -1)
			data = { ...data, value: { ...value, number: removeAtIndex(number, periodPosition) }, cursor: { ...cursor, cursor: cursor.cursor + (periodPosition < cursor.cursor ? -1 : 0) } }

		// Add the period.
		return addStrToData('.', data)
	}

	// Check for additions. Only numbers allowed here.
	if (isNumber(key)) // Numbers.
		return { ...data, value: insertAtIndex(value, key, cursor), cursor: cursor + 1 }

	// Unknown key. Ignore, do nothing.
	return data
}

// addStrToData adds a string into the data object, at the position of the cursor. It returns the new data object, with the cursor moved accordingly.
function addStrToData(str, data) {
	// Add the string at the position of the cursor or, if we are to the left of a minus sign, to the right of this minus sign instead.
	const { value, cursor } = data
	const addAt = (cursor.cursor === 0 && value[cursor.part].slice(0, 1) === '-' ? 1 : cursor.cursor)
	return { ...data, value: { ...value, [cursor.part]: insertAtIndex(value[cursor.part], str, addAt) }, cursor: { ...cursor, cursor: addAt + str.toString().length } }
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, contentsElement) {
	// Did we click on the number element?
	const numberElement = contentsElement.getElementsByClassName('number')[0]
	if (numberElement && numberElement.contains(evt.target))
		return { part: 'number', cursor: getClickPosition(evt, numberElement) }

	// Was it the power element?
	const powerElement = contentsElement.getElementsByClassName('power')[0]
	if (powerElement && powerElement.contains(evt.target))
		return { part: 'power', cursor: getClickPosition(evt, powerElement) }

	// Was it the times symbol?
	const timesElement = contentsElement.getElementsByClassName('times')[0]
	if (timesElement && timesElement.contains(evt.target))
		return { part: 'number', cursor: data.value.number.length }

	// Was it the ten symbol?
	const tenElement = contentsElement.getElementsByClassName('ten')[0]
	if (tenElement && tenElement.contains(evt.target))
		return { part: 'power', cursor: 0 }

	// Most likely we never get here. Just in case, keep the cursor as it.
	return data.cursor
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor() {
	return { part: 'number', cursor: 0 }
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value, cursor) {
	const { number, power } = value
	if (power !== '' || (cursor && cursor.part === 'power'))
		return { part: 'power', cursor: power.length }
	return { part: 'number', cursor: number.length }
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	return cursor.part === 'number' && cursor.cursor === 0
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	if (cursor.part === 'power')
		return cursor.cursor === value.power.length
	return value.power === '' && cursor.part === value.number.length
}