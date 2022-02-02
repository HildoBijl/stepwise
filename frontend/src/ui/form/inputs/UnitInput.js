import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import clsx from 'clsx'

import { repeat } from 'step-wise/util/functions'
import { lastOf, arraySplice } from 'step-wise/util/arrays'
import { selectRandomEmpty, selectRandomInvalidUnit } from 'step-wise/util/random'
import { getEmpty, isEmpty } from 'step-wise/inputTypes/Unit/Unit'
import { getEmpty as getEmptyUnitArray, isEmpty as isUnitArrayEmpty } from 'step-wise/inputTypes/Unit/UnitArray'
import { isEmpty as isUnitElementEmpty } from 'step-wise/inputTypes/Unit/UnitElement'

import FieldInput, { checkCursor } from './support/FieldInput'
import { UnitArray, keyPressToData as unitArrayKeyPressToData, mouseClickToCursor as unitArrayMouseClickToCursor, getStartCursor as getUnitArrayStartCursor, getEndCursor as getUnitArrayEndCursor, isCursorAtStart as isCursorAtUnitArrayStart, isCursorAtEnd as isCursorAtUnitArrayEnd, mergeElements, splitElement, getCursorFromOffset as getUnitArrayCursorFromOffset } from './support/UnitArray'
import { getStartCursor as getUnitElementStartCursor, getEndCursor as getUnitElementEndCursor, isCursorAtStart as isCursorAtUnitElementStart } from './support/UnitElement'

const style = (theme) => ({
	'&.filler-1': {
		pointerEvents: 'none', // To prevent it being clicked on. When the cursor is already in the numerator, the filler disappears as soon as it's clicked on, which messes up the click processing.
	},
	'& .unitElement': {
		color: theme.palette.info.main,
		'&.valid': {
			'& .prefix': {
				'& .char': {
					color: alpha(theme.palette.info.main, 0.75),
				},
			},
		},
		'&.invalid': {
			'& .prefix, .baseUnit': {
				color: theme.palette.error.main,
			},
		},
	},
	'& .fraction': {
		textAlign: 'center',

		'& .num, .den, .divider': {
			display: 'block',
		},

		'& .num, .den': {
			fontSize: '0.85em',
			height: '50%',
			padding: '0 3px', // Add padding to make the divider line wider horizontally.
			position: 'relative', // Needed for cursor positioning.

			'& .cursorContainer': {
				'& span.cursor': {
					height: '65%',
				},
			},

			'& .power': {
				'& .cursorContainer': {
					'& span.cursor': {
						height: '46%',
					},
				},
			},
		},

		'& .num': {
			'& .char': {
				lineHeight: 1.8,
			},
			'& .cursorContainer': {
				'& span.cursor': {
					top: '25%',
				},
			},
			'& .power': {
				'& .char': {
					lineHeight: 2.0,
				},
				'& .cursorContainer': {
					'& span.cursor': {
						top: '14%',
					},
				},
			},
		},

		'& .den': {
			'& .char': {
				lineHeight: 1.6,
			},
			'& .cursorContainer': {
				'& span.cursor': {
					top: '20%',
				},
			},
			'& .power': {
				'& .char': {
					lineHeight: 1.8,
				},
				'& .cursorContainer': {
					'& span.cursor': {
						top: '11%',
					},
				},
			},
		},

		'& .dividerContainer': {
			height: 0,
			pointerEvents: 'none', // To prevent it being clicked on and messing up cursor positioning.
			position: 'relative',
			width: '100%',

			'& .divider': {
				background: theme.palette.info.main,
				height: '0.5px',
				width: '100%',
			},
		},
	},
})
const useStyles = makeStyles((theme) => ({
	unitInput: style(theme)
}))
export { style }

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Eenheid',
	validate: nonEmptyAndValid,
	initialData: getEmptyData(),
	isEmpty: data => isEmpty(data.value),
	JSXObject: Unit,
	keyboardSettings: dataToKeyboardSettings,
	keyPressToData,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
}

export default function UnitInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const mergedProps = {
		...defaultProps,
		...props,
		className: clsx(props.className, classes.unitInput, 'unitInput'),
	}

	return <FieldInput {...mergedProps} />
}

// These are validation functions.
export function nonEmpty(data) {
	if (isEmpty(data.value))
		return selectRandomEmpty()
}
export function valid(data) {
	if (!isValid(data.value))
		return selectRandomInvalidUnit()
}
export function nonEmptyAndValid(data) {
	const nonEmptyValidation = nonEmpty(data)
	if (nonEmptyValidation)
		return nonEmptyValidation

	const validValidation = valid(data)
	if (validValidation)
		return validValidation
}

// Unit takes an input data object and shows the corresponding contents as JSX render.
export function Unit({ type, value, cursor }) {
	// Check input.
	if (type !== 'Unit')
		throw new Error(`Invalid type: tried to get the contents of a Unit field but got data for a type "${type}" field.`)

	// Check if anything should be shown.
	if (isEmpty(value) && !cursor)
		return null

	// If there is no denominator, only show the numerator without a fraction.
	if (!isDenominatorVisible(value, cursor)) {
		return (
			<span className="num">
				<Part {...{ part: 'num', value, cursor }} />
			</span>
		)
	}

	// If there is a denominator, show a fraction.
	return <span className="fraction">
		<span className="num">
			{
				!isUnitArrayEmpty(value.num) || (cursor && cursor.part === 'num') ?
					<Part {...{ part: 'num', value, cursor }} /> :
					<span className="char filler filler-1">1</span>
			}
		</span>
		<span className="dividerContainer"><span className="divider" /></span>
		<span className="den">
			<Part {...{ part: 'den', value, cursor }} />
		</span>
	</span>
}

function Part({ part, value, cursor }) {
	return <UnitArray {...{ type: 'UnitArray', value: value[part], cursor: cursor && cursor.part === part && cursor.cursor }} />
}

export function getEmptyData() {
	return {
		type: 'Unit',
		value: getEmpty(),
		cursor: getStartCursor(),
	}
}

// dataToKeyboardSettings takes a data object and determines what keyboard settings are appropriate.
export function dataToKeyboardSettings(data) {
	const { value: unit, cursor: unitCursor } = data

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

// keyPressToData takes a keyInfo event and a data object and returns a new data object.
export function keyPressToData(keyInfo, data, contentsElement) {
	// Extract given data.
	const { key, ctrl, alt } = keyInfo
	const { value, cursor } = data
	const { num, den } = value

	// Check where the cursor is currently at.
	const unitArray = value[cursor.part]
	const unitArrayCursor = cursor.cursor
	const unitElement = unitArray[unitArrayCursor.part]
	const unitElementCursor = unitArrayCursor.cursor

	// Set up a pass-on function.
	const passOn = () => {
		const oldUnitArrayData = {
			type: 'UnitArray',
			value: unitArray,
			cursor: unitArrayCursor,
		}
		const newUnitArrayData = unitArrayKeyPressToData(keyInfo, oldUnitArrayData)
		return {
			...data,
			value: {
				...value,
				[cursor.part]: newUnitArrayData.value,
			},
			cursor: {
				part: cursor.part,
				cursor: newUnitArrayData.cursor,
			}
		}
	}

	// Ignore ctrl/alt keys.
	if (ctrl || alt)
		return data

	// For left/right-arrows, home and end, adjust the cursor.
	if (key === 'ArrowLeft') {
		// If we're at the start of the denominator, move to the end of the numerator.
		if (cursor.part === 'den' && isCursorAtUnitArrayStart(den, unitArrayCursor))
			return { ...data, cursor: { part: 'num', cursor: getUnitArrayEndCursor(num) } }
	}
	if (key === 'ArrowRight') {
		// If we're at the end of the numerator, move to the start of the denominator if it exists.
		if (cursor.part === 'num' && isCursorAtUnitArrayEnd(num, unitArrayCursor) && !isUnitArrayEmpty(den))
			return { ...data, cursor: { part: 'den', cursor: getUnitArrayStartCursor(den) } }
	}
	if (key === 'Home') {
		// If we're at the start of the denominator, move to the start of the numerator. Otherwise move to home within the unit array.
		if (cursor.part === 'den' && isCursorAtUnitArrayStart(den, unitArrayCursor))
			return { ...data, cursor: { part: 'num', cursor: getUnitArrayStartCursor(num) } }
	}
	if (key === 'End') {
		// If we're at the end of the numerator, move to the end of the denominator. Otherwise move to the end within the unit array.
		if (cursor.part === 'num' && isCursorAtUnitArrayEnd(num, unitArrayCursor) && !isUnitArrayEmpty(den))
			return { ...data, cursor: { part: 'den', cursor: getUnitArrayEndCursor(den) } }
	}
	if (key === 'ArrowDown' && cursor.part === 'num') {
		// If there is no denominator yet, put the cursor there.
		if (isUnitArrayEmpty(den))
			return { ...data, cursor: { part: 'den', cursor: getUnitArrayStartCursor(den) } }

		// Find the position of the cursor and use it to determine the new cursor.
		const cursorOffset = contentsElement.getElementsByClassName('cursorContainer')[0].offsetLeft
		return { ...data, cursor: { part: 'den', cursor: getUnitArrayCursorFromOffset(den, contentsElement.getElementsByClassName('den')[0], cursorOffset) } }
	}
	if (key === 'ArrowUp' && cursor.part === 'den') {
		// If there is no numerator, put the cursor at its start.
		if (isUnitArrayEmpty(num))
			return { ...data, cursor: { part: 'num', cursor: getUnitArrayStartCursor(num) } }

		// Find the position of the cursor and use it to determine the new cursor.
		const cursorOffset = contentsElement.getElementsByClassName('cursorContainer')[0].offsetLeft
		return { ...data, cursor: { part: 'num', cursor: getUnitArrayCursorFromOffset(num, contentsElement.getElementsByClassName('num')[0], cursorOffset) } }
	}

	// For backspace/delete, delete the appropriate symbol.
	if (key === 'Backspace') {
		if (cursor.part === 'den' && isCursorAtUnitArrayStart(unitArray, unitArrayCursor)) // Cursor is at the start of the denominator.
			return { ...data, ...mergeNumeratorAndDenominator(value, true) } // Merge the numerator and denominator in the appropriate way.
	}
	if (key === 'Delete') {
		if (cursor.part === 'num' && isCursorAtUnitArrayEnd(unitArray, unitArrayCursor) && isDenominatorVisible(value, cursor)) // Cursor is at the end of the numerator.
			return { ...data, ...mergeNumeratorAndDenominator(value, false) } // Merge the numerator and denominator in the appropriate way.
	}

	// For the minus sign, if we're in a power, throw the unit to the other unit array.
	if ((key === '-' || key === 'Minus') && unitElementCursor.part === 'power') {
		const partA = cursor.part
		const partB = partA === 'num' ? 'den' : 'num'
		const unitArrayA = unitArray.length === 1 ? getEmptyUnitArray() : arraySplice(unitArray, unitArrayCursor.part, 1)
		const unitArrayB = isUnitArrayEmpty(value[partB]) ? [unitElement] : [...value[partB], unitElement]
		return {
			...data,
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
		const newNum = (divideAt === 0 ? getEmptyUnitArray() : mergedUnitArray.slice(0, divideAt))
		const newDen = (divideAt === mergedUnitArray.length ? getEmptyUnitArray() : mergedUnitArray.slice(divideAt))
		return {
			...data,
			value: { num: newNum, den: newDen },
			cursor: { part: 'den', cursor: getUnitArrayStartCursor(newDen) },
		}
	}

	// Unknown key. Try to pass it on.
	return passOn()
}

// mouseClickToCursor takes an event object like a "click" (but possibly also a drag) and, for the given field, returns the cursor object related to the click.
export function mouseClickToCursor(evt, data, contentsElement) {
	const { value, cursor } = data

	// Check on which part was clicked.
	let unitArrayElement
	const part = ['num', 'den'].find(part => {
		unitArrayElement = contentsElement.getElementsByClassName(part)[0]
		return unitArrayElement && unitArrayElement.contains(evt.target)
	})
	if (unitArrayElement) {
		const unitArrayData = { type: 'UnitArray', value: value[part], cursor: cursor && cursor.part === part && cursor.cursor }
		const newCursor = unitArrayMouseClickToCursor(evt, unitArrayData, unitArrayElement)
		return checkCursor(newCursor) && { part, cursor: newCursor }
	}

	// We shouldn't get here, but if we do just keep the cursor as is.
	return cursor
}

// getStartCursor gives the cursor position at the start.
export function getStartCursor(value = getEmpty(), cursor = null) {
	const unitArrayCursor = cursor && cursor.part === 'num' && cursor.cursor
	return { part: 'num', cursor: getUnitArrayStartCursor(value.num, unitArrayCursor) }
}

// getEndCursor gives the cursor position at the end.
export function getEndCursor(value = getEmpty(), cursor = null) {
	const part = isDenominatorVisible(value, cursor) ? 'den' : 'num'
	const unitArrayCursor = cursor && cursor.part === part && cursor.cursor
	return { part, cursor: getUnitArrayEndCursor(value[part], unitArrayCursor) }
}

// isCursorAtStart returns a boolean: is the cursor at the start?
export function isCursorAtStart(value, cursor) {
	return cursor.part === 'num' && isCursorAtUnitArrayStart(value.num, cursor.cursor)
}

// isCursorAtEnd returns a boolean: is the cursor at the end?
export function isCursorAtEnd(value, cursor) {
	if (isDenominatorVisible(value, cursor))
		return cursor.part === 'den' && isCursorAtUnitArrayEnd(value.den, cursor.cursor)
	return isCursorAtUnitArrayEnd(value.num, cursor.cursor)
}

// isValid checks if a unit IO is valid.
export function isValid(value) {
	const { num, den } = value
	return [num, den].every(unitArray => isUnitArrayEmpty(unitArray) || unitArray.every(unitElement => !unitElement.invalid))
}

// isDenominatorVisible decides if the denominator should be visible or not when displaying the unit.
export function isDenominatorVisible(value, cursor) {
	return !isUnitArrayEmpty(value.den) || (cursor && cursor.part === 'den')
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
		value: { num: newNumerator, den: getEmptyUnitArray() },
		cursor: { part: 'num', cursor: newNumeratorCursor },
	}
}
