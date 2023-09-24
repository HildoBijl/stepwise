import React from 'react'

import { isNumber } from 'step-wise/util'
import { decimalSeparator } from 'step-wise/settings/numbers'

import { latexMinus } from 'ui/components'

import { InlineCursor } from './InlineCursor'

// CharString takes a string, turns it into an array of JSX char elements and returns it. If a cursor position (a number) is given, then the cursor is put in that position.
export function CharString({ str, cursor = undefined }) {
	// Check the input.
	if (cursor && !isNumber(cursor))
		throw new Error(`Invalid cursor position: the cursor position has to be a number, but its value was "${cursor}".`)
	if (cursor && (cursor < 0 || cursor > str.length))
		throw new Error(`Invalid cursor position: the cursor position was an invalid number. For a string of length ${str.length} you cannot have a cursor position with value ${cursor}.`)

	// Preprocess the string.
	str = str.replace('-', latexMinus) // Replace a minus sign by a special minus sign.
	str = str.replace('.', decimalSeparator) // Replace a period by a decimal separator.

	// Set up the digits array with JSX elements, add a potential cursor and return it all.
	const chars = str.split('').map((char, ind) => <span className="char" key={ind}>{char}</span>)
	if (isNumber(cursor))
		chars.splice(cursor, 0, <InlineCursor key="cursor" />)
	return <>{chars}</>
}
