import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import FieldInput from '../support/FieldInput'
import { style as floatStyle, Float, isEmpty as isFloatEmpty } from '../FloatInput'
import { style as unitStyle, Unit } from '../UnitInput'

import { emptySI, isEmpty, isUnitVisible, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, getFloatFI, getUnitFI, clean, functionalize, mouseClickToCursor, FIToKeyboardSettings, keyPressToFI, errorToMessage } from './support'
import { nonEmptyUnit } from './validation'

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Getal met eenheid',
	validate: nonEmptyUnit,
	initialSI: emptySI,
	isEmpty: FI => isEmpty(FI.value),
	JSXObject: FloatUnit,
	keyboardSettings: FIToKeyboardSettings,
	keyPressToFI: keyPressToFI,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	clean,
	functionalize,
	errorToMessage,
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
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => FIToKeyboardSettings(FI, positive, allowPower),
		...props,
		className: clsx(props.className, classes.floatUnitInput, 'floatUnitInput'),
	}

	return <FieldInput {...mergedProps} />
}

// FloatUnit takes an FI object and shows the corresponding contents as JSX render.
export function FloatUnit(FI) {
	const { type, value, cursor } = FI
	const { float } = value

	// Check input.
	if (type !== 'FloatUnit')
		throw new Error(`Invalid type: tried to get the contents of a FloatUnit field but got an FI with type "${type}".`)

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
					<Float {...getFloatFI(FI)} />
			}
		</span>
		{
			isUnitVisible(value, cursor) ? (
				<>
					<span className="spacer unitSpacer" />
					<span className="unit">
						<Unit {...getUnitFI(FI)} />
					</span>
				</>
			) : null}
	</>
}
