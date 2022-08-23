import React from 'react'
import clsx from 'clsx'

import FieldInput, { CharString } from '../support/FieldInput'

import { emptySI, isEmpty, getStartCursor, getEndCursor, isCursorAtStart, isCursorAtEnd, mouseClickToCursor, FIToKeyboardSettings, keyPressToFI, errorToMessage } from './support'

const defaultProps = {
	basic: true, // To get the basic character layout.
	placeholder: 'Geheel getal',
	positive: false,
	validate: undefined,
	initialSI: emptySI,
	isEmpty: SI => isEmpty(SI.value),
	JSXObject: Integer,
	keyboardSettings: FIToKeyboardSettings,
	keyPressToFI,
	mouseClickToCursor,
	getStartCursor,
	getEndCursor,
	isCursorAtStart,
	isCursorAtEnd,
	errorToMessage,
}

export default function IntegerInput(props) {
	// Gather all relevant data.
	const positive = props.positive !== undefined ? props.positive : defaultProps.positive
	const mergedProps = {
		...defaultProps,
		keyPressToFI: (keyInfo, FI) => keyPressToFI(keyInfo, FI, positive),
		keyboardSettings: (FI) => FIToKeyboardSettings(FI, positive),
		...props,
		className: clsx(props.className, 'integerInput'),
	}

	return <FieldInput {...mergedProps} />
}

// Integer takes an FI object and shows the corresponding contents as JSX render.
export function Integer({ type, value, cursor }) {
	if (type !== 'Integer')
		throw new Error(`Invalid type: tried to get the contents of an Integer field but got an FI with type "${type}".`)
	return <CharString str={value} cursor={cursor} />
}
