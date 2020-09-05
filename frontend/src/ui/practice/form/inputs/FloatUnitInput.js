import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { isNumber } from 'step-wise/util/numbers'
import { isLetter } from 'step-wise/util/strings'
import { selectRandomly, selectRandomEmpty } from 'step-wise/util/random'

import { getEmpty, isEmpty } from 'step-wise/inputTypes/FloatUnit'
import { isEmpty as isFloatEmpty, isValid as isFloatValid } from 'step-wise/inputTypes/Float'
import { isEmpty as isUnitEmpty, isValid as isUnitValid } from 'step-wise/inputTypes/Unit'

import Input, { checkCursor } from './Input'
import { getClickSide } from '../../../../util/dom'

import { style as floatStyle, nonEmpty as floatNonEmpty, dataToContents as floatDataToContents, cursorToKeyboardType as floatCursorToKeyboardType, keyPressToData as floatKeyPressToData, mouseClickToCursor as floatMouseClickToCursor, getStartCursor as getFloatStartCursor, getEndCursor as getFloatEndCursor, isCursorAtStart as isCursorAtFloatStart, isCursorAtEnd as isCursorAtFloatEnd } from './FloatInput'
import { style as unitStyle, valid as unitValid, dataToContents as unitDataToContents, cursorToKeyboardType as unitCursorToKeyboardType, keyPressToData as unitKeyPressToData, mouseClickToCursor as unitMouseClickToCursor, getStartCursor as getUnitStartCursor, getEndCursor as getUnitEndCursor, isCursorAtStart as isCursorAtUnitStart, isCursorAtEnd as isCursorAtUnitEnd } from './UnitInput'

const style = (theme) => ({
	'& .float': {
		...floatStyle(theme),
	},
	'& .spacer.unitSpacer': {
		width: '0.3em',
	},
	'& .unit': {
		...unitStyle(theme),
	},
})
const useStyles = makeStyles((theme) => ({
	floatUnitInput: style(theme)
}))
export { style }

const defaultProps = {
	placeholder: 'Getal met eenheid',
	validate: validNumberAndNonEmptyUnit,
	initialData: getEmptyData(),
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

export default function FloatUnitInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const allowPower = props.allowPower !== undefined ? props.allowPower : defaultProps.allowPower
	const mergedProps = {
		...defaultProps,
		keyPressToData: (keyInfo, data, contentsElement) => keyPressToData(keyInfo, data, contentsElement, positive, allowPower),
		...props,
		className: clsx(props.className, classes.floatUnitInput, 'floatUnitInput'),
	}

	return <Input {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	if (isEmpty(data.value))
		return selectRandomEmpty()
}
export function validNumberAndUnit(data) {
	// Check float. First check if it's empty and give a message dedicated to the number. Then check for other edge cases.
	if (isFloatEmpty(data.value.unit))
		return selectRandomly([
			'Je hebt geen getal ingevuld.',
			'Het getal ontbreekt.',
			'Vergeet niet een getal in te vullen!',
			'Waar is het getal?',
		])
	const floatNonEmptyResult = floatNonEmpty(getFloatData(data))
	if (floatNonEmptyResult)
		return floatNonEmptyResult

	// Check unit.
	const unitValidResult = unitValid(getUnitData(data))
	if (unitValidResult)
		return unitValidResult
}
export function validNumberAndNonEmptyUnit(data) {
	const validNumberAndUnitResult = validNumberAndUnit(data)
	if (validNumberAndUnitResult)
		return validNumberAndUnitResult

	if (isUnitEmpty(data.value.unit))
		return selectRandomly([
			'Je hebt geen eenheid ingevuld.',
			'De eenheid ontbreekt.',
			'Vergeet niet een eenheid in te vullen!',
			'Waar is de eenheid?',
		])
}

// dataToContents takes an input data object and shows the corresponding contents as JSX render.
export function dataToContents(data) {
	const { type, value, cursor } = data
	const { float } = value

	// Check input.
	if (type !== 'FloatUnit')
		throw new Error(`Invalid type: tried to get the contents of a FloatUnit field but got data for a type "${type}" field.`)

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// Show the FloatUnit.
	const showFloatFiller = isFloatEmpty(float) && (!cursor || cursor.part !== 'float')
	return <>
		<span className="float">{showFloatFiller ? <span className="char filler">?</span> : floatDataToContents(getFloatData(data))}</span>
		{isUnitVisible(value, cursor) ? <>
			<span className="spacer unitSpacer" />
			<span className="unit">{unitDataToContents(getUnitData(data))}</span>
		</> : null}
	</>
}

export function getEmptyData() {
	return {
		type: 'FloatUnit',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// cursorToKeyboardType takes a cursor object (where is the cursor) and determines which Android keyboard needs to be shown: 'number', 'text' or 'none'.
export function cursorToKeyboardType(cursor) {
	if (!cursor)
		return 'none'
	if (cursor.part === 'float')
		return floatCursorToKeyboardType(cursor.cursor)
	return unitCursorToKeyboardType(cursor.cursor)
}

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, contentsElement, positive, allowPower) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const { float, unit } = value

	// Check where the cursor is currently at.
	const floatCursor = cursor && cursor.part === 'float' && cursor.cursor
	const unitCursor = cursor && cursor.part === 'unit' && cursor.cursor
	const floatData = getFloatData(data)
	const unitData = getUnitData(data)

	// Set up a pass-on function.
	const passOn = (part = cursor.part, partCursor) => {
		// Check which part to pass it on to.
		let newData = {}
		if (part === 'float') {
			const oldFloatData = {
				...floatData,
				cursor: partCursor || floatData.cursor,
			}
			newData = floatKeyPressToData(keyInfo, oldFloatData, contentsElement, positive, allowPower)
		}
		if (part === 'unit') {
			const oldUnitData = {
				...unitData,
				cursor: partCursor || unitData.cursor,
			}
			newData = unitKeyPressToData(keyInfo, oldUnitData, contentsElement)
		}

		// Merge resulting data.
		return {
			...data,
			value: {
				...value,
				[part]: newData.value,
			},
			cursor: {
				part,
				cursor: newData.cursor,
			}
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		// If we're at the start of the unit, move to the end of the float.
		if (cursor.part === 'unit' && isCursorAtUnitStart(unit, unitCursor))
			return { ...data, cursor: { part: 'float', cursor: getFloatEndCursor(float, floatCursor) } }
	}
	if (key === 'ArrowRight') {
		// If we're at the end of the float, move to the start of the unit, assuming we're not in an empty field.
		if (cursor.part === 'float' && isCursorAtFloatEnd(float, floatCursor) && !isEmpty(value))
			return { ...data, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}
	if (key === 'Home')
		return { ...data, cursor: { part: 'float', cursor: getFloatStartCursor(float) } } // Move to the start of the float.
	if (key === 'End') {
		if (isUnitVisible(value, cursor))
			return { ...data, cursor: { part: 'unit', cursor: getUnitEndCursor(unit) } } // Move to the end of the unit.
		return { ...data, cursor: { part: 'float', cursor: getFloatEndCursor(float) } } // Move to the end of the float.
	}


	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		// If the cursor is at the start of the unit, move it to the end of the float.
		if (cursor.part === 'unit' && isCursorAtUnitStart(unit, unitCursor))
			return { ...data, cursor: { part: 'float', cursor: getFloatEndCursor(float, floatCursor) } }
	}
	if (key === 'Delete') {
		// If the cursor is at the end of the float, move it to the start of the unit.
		if (cursor.part === 'float' && isCursorAtFloatEnd(float, floatCursor) && isUnitVisible(value, cursor))
			return { ...data, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}

	// In case of a space, if we're in the float, move to the start of the unit.
	if (key === ' ') {
		if (cursor.part === 'float')
			return { ...data, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
	}

	// In case of a letter in the float, process them like we're in the unit.
	if (isLetter(key) && cursor.part === 'float')
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
export function mouseClickToCursor(evt, data, contentsElement) {
	const { value, cursor } = data
	const { float, unit } = value

	// Check on which part was clicked.
	let partElement
	let part = ['float', 'unitSpacer', 'unit'].find(part => {
		partElement = contentsElement.getElementsByClassName(part)[0]
		return partElement && partElement.contains(evt.target)
	})

	// Find a new cursor given this part.
	let newCursor
	if (part === 'float') {
		if (evt.target.classList.contains('filler'))
			newCursor = getFloatStartCursor(float)
		else
			newCursor = floatMouseClickToCursor(evt, getFloatData(data), partElement)
	} else if (part === 'unit') {
		newCursor = unitMouseClickToCursor(evt, getUnitData(data), partElement)
	} else if (part === 'unitSpacer') {
		if (getClickSide(evt) === 0) {
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
	return checkCursor(newCursor) && { part, cursor: newCursor }
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor(value = getEmpty(), cursor = null) {
	return { part: 'float', cursor: getFloatStartCursor(value.float, cursor && cursor.part === 'float' && cursor.cursor) }
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value = getEmpty(), cursor = null) {
	const part = isUnitVisible(value, cursor) ? 'unit' : 'float'
	if (part === 'float')
		return { part, cursor: getFloatEndCursor(value[part], cursor && cursor.part === part && cursor.cursor) }
	return { part, cursor: getUnitEndCursor(value[part], cursor && cursor.part === part && cursor.cursor) }
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	return cursor.part === 'float' && isCursorAtFloatStart(value.float, cursor.cursor)
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	if (isUnitVisible(value, cursor))
		return cursor.part === 'unit' && isCursorAtUnitEnd(value.unit, cursor.cursor)
	return isCursorAtFloatEnd(value.float, cursor.cursor)
}

// isValid checks if a FloatUnit IO is valid.
export function isValid(value) {
	const { float, unit } = value
	return isFloatValid(float) && isUnitValid(unit)
}

// isUnitVisible decides if the unit should be visible or not.
export function isUnitVisible(value, cursor) {
	return !isUnitEmpty(value.unit) || (cursor && cursor.part === 'unit')
}

// getFloatData gives a Float type of data object from a FloatUnit type of data object.
export function getFloatData(data) {
	const { value, cursor } = data
	return {
		type: 'Float',
		value: value.float,
		cursor: cursor && cursor.part === 'float' && cursor.cursor,
	}
}

// getUnitData gives a Unit type of data object from a FloatUnit type of data object.
export function getUnitData(data) {
	const { value, cursor } = data
	return {
		type: 'Unit',
		value: value.unit,
		cursor: cursor && cursor.part === 'unit' && cursor.cursor,
	}
}