import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { selectRandomNegative } from 'util/feedbackMessages'

import FieldInput, { CharString } from '../support/FieldInput'

import { emptySI, isEmpty, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, clean, functionalize, mouseClickToCursor, FIToKeyboardSettings, keyPressToFI, errorToMessage } from './support'

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Kommagetal',
	positive: false,
	allowPower: true,
	validate: undefined,
	initialSI: emptySI,
	isEmpty: SI => isEmpty(SI.value),
	JSXObject: Float,
	keyboardSettings: FIToKeyboardSettings,
	keyPressToFI,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	clean,
	functionalize,
	errorToMessage,
}

// Define styles.
const style = (theme) => ({
	'& .tenPowerContainer': {
		// color: theme.palette.info.main,
	},
})
const useStyles = makeStyles((theme) => ({
	floatInput: style(theme),
}))
export { style }

export default function FloatInput(props) {
	// Gather all relevant data.
	const classes = useStyles()
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const allowPower = props.allowPower !== undefined ? props.allowPower : defaultProps.allowPower
	const mergedProps = {
		...defaultProps,
		keyPressToFI: (keyInfo, FI, contentsElement) => keyPressToFI(keyInfo, FI, contentsElement, positive, allowPower),
		keyboardSettings: (FI) => FIToKeyboardSettings(FI, positive, allowPower),
		...props,
		className: clsx(props.className, classes.floatInput, 'floatInput'),
	}

	return <FieldInput {...mergedProps} />
}

// Float takes an input FI object and shows the corresponding contents as JSX render.
export function Float({ type, value, cursor }) {
	// Check input.
	if (type !== 'Float')
		throw new Error(`Invalid type: tried to get the contents of a Float field but got an FI with type "${type}".`)

	// Set up the output.
	const { number, power } = value
	const showPower = power !== '' || (cursor && cursor.part === 'power')
	return <>
		<span className="number">
			<CharString str={number} cursor={cursor && cursor.part === 'number' && cursor.cursor} />
		</span>
		{!showPower ? null : <span className="tenPowerContainer">
			<span className="char times">⋅</span>
			<span className="char ten">10</span>
			<span className="power">
				<CharString str={power} cursor={cursor && cursor.part === 'power' && cursor.cursor} />
			</span>
		</span>}
	</>
}
