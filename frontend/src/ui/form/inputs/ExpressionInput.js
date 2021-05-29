import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { lastOf, arraySplice } from 'step-wise/util/arrays'
import { isNumber } from 'step-wise/util/numbers'
import { isLetter } from 'step-wise/util/strings'
import { selectRandomEmpty } from 'step-wise/util/random'
import { removeAtIndex, insertAtIndex } from 'step-wise/util/strings'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Expression'

import { RBM } from 'ui/components/equations'

import Input, { CharString, getClickPosition } from './support/Input'

const style = (theme) => ({
	// TODO: STILL NEEDED?
	'& .tenPowerContainer': {
		// color: theme.palette.info.main,
	},
})
const useStyles = makeStyles((theme) => ({
	expressionInput: style(theme),
}))
export { style }

const defaultProps = {
	placeholder: 'Uitdrukking',
	validate: nonEmpty,
	initialData: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
	JSXObject: Expression,
	keyboardSettings: dataToKeyboardSettings,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
}

export default function ExpressionInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		className: clsx(props.className, classes.expressionInput, 'expressionInput'),
	}

	return <Input {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	// If it's empty note it.
	const { value } = data
	if (isEmpty(value))
		return selectRandomEmpty()
}

// Float takes an input data object and shows the corresponding contents as JSX render.
export function Expression({ type, value, cursor }) {
	// Check input.
	if (type !== 'Expression')
		throw new Error(`Invalid type: tried to get the contents of an Expression field but got data for a type "${type}" field.`)

	// Set up the output.
	console.log(value)
	console.log(cursor)
	return <RBM>{value[0]}</RBM>
	// const { number, power } = value
	// const showPower = power !== '' || (cursor && cursor.part === 'power')
	// return <>
	// 	<span className="number">
	// 		<CharString str={number} cursor={cursor && cursor.part === 'number' && cursor.cursor} />
	// 	</span>
	// 	{!showPower ? null : <span className="tenPowerContainer">
	// 		<span className="char times">⋅</span>
	// 		<span className="char ten">10</span>
	// 		<span className="power">
	// 			<CharString str={power} cursor={cursor && cursor.part === 'power' && cursor.cursor} />
	// 		</span>
	// 	</span>}
	// </>
}

// getEmptyData returns an empty data object, ready to be filled by input.
export function getEmptyData() {
	return {
		type: 'Expression',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
export function dataToKeyboardSettings(data) {
	// const { value, cursor } = data

	// Determine which keys to disable.
	let keySettings = {}
	keySettings.Minus = false // TODO: PLACEHOLDER. REMOVE.

	// Pass on settings.
	return {
		keySettings,
		float: {},
		unit: {},
		// ToDo
	}
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, contentsElement, positive = defaultProps.positive, allowPower = defaultProps.allowPower) {
	// Let's walk through a large variety of cases and see what's up.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// ToDo: check if we are in a special type (odd-numbered) and then pass it to that object.

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		// ToDo: check if we need to move to another part.
		return { ...data, cursor: { ...cursor, cursor: Math.max(cursor.cursor - 1, 0) } } // Move one position to the left.
	}
	if (key === 'ArrowRight') {
		// ToDo: check if we need to move to another part.
		return { ...data, cursor: { ...cursor, cursor: Math.min(cursor.cursor + 1, value[cursor.part].length) } } // Move the cursor one position to the right.
	}
	if (key === 'Home') // ToDo: if within a part, go to the start of said part. When already at the start, go to the start of everything. (And same with end.)
		return { ...data, cursor: getStartCursor(value, cursor) }
	if (key === 'End')
		return { ...data, cursor: getEndCursor(value, cursor) }

	// For backspace/delete, remove the appropriate symbol.
	if (key === 'Backspace') {
		if (isCursorAtStart(value, cursor)) // Cursor is at the start.
			return data // Do nothing.
		// ToDo: when the cursor is at the start of a string after a special part, deal with this appropriately.
		return { ...data, value: arraySplice(value, cursor.part, 1, removeAtIndex(value[cursor.part], cursor.cursor - 1)), cursor: { ...cursor, cursor: cursor.cursor - 1 } } // Just remove the previous character.
	}
	if (key === 'Delete') {
		if (isCursorAtEnd(value, cursor)) // Cursor is at the end.
			return data // Do nothing.
		// ToDo: when the cursor is at the end of a string before a special part, deal with this appropriately.
		return { ...data, value: arraySplice(value, cursor.part, 1, removeAtIndex(value[cursor.part], cursor.cursor)) } // Just remove the upcoming character.
	}

	// Check for additions.
	if (isLetter(key) || isNumber(key)) // Letters and numbers.
		return addStrToData(key, data)
	if (key === '+' || key === 'Plus') // Plus.
		return addStrToData('+', data)
	if (key === '-' || key === 'Minus') // Minus.
		return addStrToData('-', data)
	if (key === '*' || key === 'Times') // Times.
		return addStrToData('*', data)
	if (key === '(' || key === ')') // Brackets.
		return addStrToData(key, data)
	if (key === '.' || key === ',') // Period.
		return addStrToData('.', data)

	// Unknown key. Ignore, do nothing.
	return data
}

// addStrToData adds a string into the data object, at the position of the cursor. It returns the new data object, with the cursor moved accordingly.
function addStrToData(str, data) {
	const { value, cursor } = data
	const adjustedString = insertAtIndex(value[cursor.part], str, cursor.cursor)
	return {
		...data,
		value: arraySplice(value, cursor.part, 1, adjustedString),
		cursor: { ...cursor, cursor: cursor.cursor + str.toString().length },
	}
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, contentsElement) {
	return getStartCursor()

	// TODO
	// // Did we click on the number element?
	// const numberElement = contentsElement.getElementsByClassName('number')[0]
	// if (numberElement && numberElement.contains(evt.target))
	// 	return { part: 'number', cursor: getClickPosition(evt, numberElement) }

	// // Was it the power element?
	// const powerElement = contentsElement.getElementsByClassName('power')[0]
	// if (powerElement && powerElement.contains(evt.target))
	// 	return { part: 'power', cursor: getClickPosition(evt, powerElement) }

	// // Was it the times symbol?
	// const timesElement = contentsElement.getElementsByClassName('times')[0]
	// if (timesElement && timesElement.contains(evt.target))
	// 	return { part: 'number', cursor: data.value.number.length }

	// // Was it the ten symbol?
	// const tenElement = contentsElement.getElementsByClassName('ten')[0]
	// if (tenElement && tenElement.contains(evt.target))
	// 	return { part: 'power', cursor: 0 }

	// // Most likely we never get here. Just in case, keep the cursor as it.
	// return data.cursor
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor(value = getEmpty(), cursor = null) {
	return { part: 0, cursor: 0 }
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value = getEmpty(), cursor = null) {
	return { part: value.length - 1, cursor: lastOf(value).length }
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	return cursor.part === 0 && cursor.cursor === 0
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	return cursor.part === value.length - 1 && cursor.cursor === lastOf(value).length
}

// isValid checks if a float IO is valid.
export function isValid(value) {
	return false // ToDo: check brackets and stuff.
}