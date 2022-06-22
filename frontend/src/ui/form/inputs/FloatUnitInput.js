import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { isNumber } from 'step-wise/util/numbers'
import { isLetter } from 'step-wise/util/strings'

import { units } from 'step-wise/inputTypes/Unit/units'
import { prefixes } from 'step-wise/inputTypes/Unit/prefixes'

import { getClickSide } from 'util/dom'
import { selectRandomEmpty, selectRandomMissingNumber, selectRandomMissingUnit } from 'util/feedbackMessages'

import FieldInput, { checkCursor } from './support/FieldInput'
import { style as floatStyle, nonEmpty as floatNonEmpty, Float, dataToKeyboardSettings as floatDataToKeyboardSettings, keyPressToData as floatKeyPressToData, mouseClickToCursor as floatMouseClickToCursor, emptyFloat, isEmpty as isFloatEmpty, getStartCursor as getFloatStartCursor, getEndCursor as getFloatEndCursor, isCursorAtStart as isCursorAtFloatStart, isCursorAtEnd as isCursorAtFloatEnd, isValid as isFloatValid, clean as cleanFloat, functionalize as functionalizeFloat } from './FloatInput'
import { style as unitStyle, valid as unitValid, Unit, dataToKeyboardSettings as unitDataToKeyboardSettings, keyPressToData as unitKeyPressToData, mouseClickToCursor as unitMouseClickToCursor, emptyUnit, isEmpty as isUnitEmpty, getStartCursor as getUnitStartCursor, getEndCursor as getUnitEndCursor, isCursorAtStart as isCursorAtUnitStart, isCursorAtEnd as isCursorAtUnitEnd, isValid as isUnitValid, clean as cleanUnit, functionalize as functionalizeUnit } from './UnitInput'

// Define various trivial objects and functions.
export const emptyFloatUnit = {}
export const parts = ['float', 'unit']
export const emptyData = { type: 'FloatUnit', value: emptyFloatUnit }
export const isEmpty = ({ float, unit }) => isFloatEmpty(float) && isUnitEmpty(unit)
export const isUnitVisible = ({ unit }, cursor) => !isUnitEmpty(unit) || (cursor && cursor.part === 'unit')
export const getStartCursor = (value, cursor) => ({ part: 'float', cursor: getFloatStartCursor(value.float, cursor && cursor.part === 'float' && cursor.cursor) })
export const getEndCursor = (value, cursor) => {
	const part = isUnitVisible(value, cursor) ? 'unit' : 'float'
	return { part, cursor: (part === 'float' ? getFloatEndCursor : getUnitEndCursor)(value[part], cursor && cursor.part === part && cursor.cursor) }
}
export const isCursorAtStart = ({ float }, cursor) => cursor.part === 'float' && isCursorAtFloatStart(float, cursor.cursor)
export const isCursorAtEnd = (value, cursor) => isUnitVisible(value, cursor) ? (cursor.part === 'unit' && isCursorAtUnitEnd(value.unit, cursor.cursor)) : isCursorAtFloatEnd(value.float, cursor.cursor)
export const isValid = ({ float, unit }) => isFloatValid(float) && isUnitValid(unit)
export const getFloatData = ({ value, cursor }) => ({ type: 'Float', value: value.float, cursor: cursor && cursor.part === 'float' && cursor.cursor })
export const getUnitData = ({ value, cursor }) => ({ type: 'Unit', value: value.unit, cursor: cursor && cursor.part === 'unit' && cursor.cursor })
export const clean = ({ float, unit }) => {
	const result = {}
	if (!isFloatEmpty(float))
		result.float = cleanFloat(float)
	if (!isUnitEmpty(unit))
		result.unit = cleanUnit(unit)
	return result
}
export const functionalize = ({ float, unit }) => ({ float: functionalizeFloat(float || emptyFloat), unit: functionalizeUnit(unit || emptyUnit) })

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Getal met eenheid',
	validate: validNumberAndNonEmptyUnit,
	initialData: emptyData,
	isEmpty: data => isEmpty(data.value),
	JSXObject: FloatUnit,
	keyboardSettings: dataToKeyboardSettings,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	clean,
	functionalize,
}

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

export default function FloatUnitInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const allowPower = props.allowPower !== undefined ? props.allowPower : defaultProps.allowPower
	const mergedProps = {
		...defaultProps,
		keyPressToData: (keyInfo, data, contentsElement) => keyPressToData(keyInfo, data, contentsElement, positive, allowPower),
		keyboardSettings: (data) => dataToKeyboardSettings(data, positive, allowPower),
		...props,
		className: clsx(props.className, classes.floatUnitInput, 'floatUnitInput'),
	}

	return <FieldInput {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) { // Something must have been filled in.
	if (isEmpty(data.value))
		return selectRandomEmpty()
}
export function validNumberAndUnit(data) { // The number and unit must be valid. A missing unit is OK.
	// Check float. First check if it's empty and give a message dedicated to the number. Then check for other edge cases.
	if (isFloatEmpty(data.value.unit))
		return selectRandomMissingNumber()
	const floatNonEmptyResult = floatNonEmpty(getFloatData(data))
	if (floatNonEmptyResult)
		return floatNonEmptyResult

	// Check unit.
	const unitValidResult = unitValid(getUnitData(data))
	if (unitValidResult)
		return unitValidResult
}
export function validNumberAndNonEmptyUnit(data) { // The number and unit must be valid. A missing (empty) unit is not OK.
	const validNumberAndUnitResult = validNumberAndUnit(data)
	if (validNumberAndUnitResult)
		return validNumberAndUnitResult

	if (isUnitEmpty(data.value.unit))
		return selectRandomMissingUnit()
}

// FloatUnit takes an input data object and shows the corresponding contents as JSX render.
export function FloatUnit(data) {
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
		<span className="float">
			{
				showFloatFiller ?
					<span className="char filler">?</span> :
					<Float {...getFloatData(data)} />
			}
		</span>
		{
			isUnitVisible(value, cursor) ? (
				<>
					<span className="spacer unitSpacer" />
					<span className="unit">
						<Unit {...getUnitData(data)} />
					</span>
				</>
			) : null}
	</>
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
export function dataToKeyboardSettings(data, positive = false, allowPower = true) {
	const { value, cursor } = data

	// Find the settings for the individual parts and merge the key settings.
	const floatSettings = floatDataToKeyboardSettings({ value: value.float, cursor: cursor.part === 'float' ? cursor.cursor : null }, positive, allowPower)
	const unitSettings = unitDataToKeyboardSettings({ value: value.unit, cursor: cursor.part === 'unit' ? cursor.cursor : null })
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
	if (key === ' ' || key === 'Spacebar') {
		if (cursor.part === 'float')
			return { ...data, cursor: { part: 'unit', cursor: getUnitStartCursor(unit) } }
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
