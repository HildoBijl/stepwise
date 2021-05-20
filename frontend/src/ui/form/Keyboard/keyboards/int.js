import React, { useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import clsx from 'clsx'

import { useWidthTracker, usePrevious } from 'util/react'
import { M } from 'ui/components/equations'

import KeyButton from './KeyButton'

export const tab = <M>123</M>

// These are commonly used settings for the keyboard.
export const standard = { int: {} }
export const positive = { int: { positive: true } }
export const minusDisabled = { int: { '-': 'disabled' } }

const useStyles = makeStyles((theme) => ({
	buttons: {
		display: 'grid',
		gap: ({ rowHeight }) => `${rowHeight * 0.1}px`,
		gridTemplateColumns: ({ numColumns }) => `repeat(${numColumns}, 1fr)`,
		gridTemplateRows: ({ numRows }) => `repeat(${numRows}, 1fr)`,
		margin: '0.4rem 0',

		'& .keyButton': {
			borderRadius: ({ rowHeight }) => `${rowHeight * 0.15}px`,
			height: ({ rowHeight }) => `${rowHeight * 0.9}px`, // Not the full height because of the gap.
			padding: ({ rowHeight }) => `${rowHeight * 0.15}px`,
		},

		'& .keyBackspace': {
			gridColumn: ({ positive, numRows }) => positive && numRows === 2 ? '6 / span 2' : 'auto', // When only positive numbers are allowed, span two columns.
		},
		'& .key-': {
			display: ({ positive }) => positive ? 'none' : 'block',
		},
	},
}))

export function Buttons({ settings, keyFunction }) {
	// Determine the keyboard layout.
	const prevSettings = usePrevious(settings)
	settings = settings || prevSettings // When the settings turn to null, use the previous one for display purposes.
	const positive = !!settings.positive
	const smallScreen = !useMediaQuery(theme => theme.breakpoints.up('sm'))
	const numColumns = smallScreen ? 7 : (positive ? 13 : 14)
	const numRows = smallScreen ? 2 : 1
	const keys = getKeyOrder(numRows)

	// Determine the row height.
	const buttonsRef = useRef()
	const width = useWidthTracker(buttonsRef)
	const rowHeight = width / numColumns
	const classes = useStyles({ rowHeight, numColumns, numRows, positive })

	// ToDo: make a wrapper for all keyboard Buttons functions? And then one for button, getting the key, the click handler and possibly the aspect ratio?

	return (
		<div ref={buttonsRef} className={clsx(classes.buttons, 'buttons')}>
			{keys.map(keyID => (
				<KeyButton
					key={keyID} // For React.
					keyID={keyID} // To pass to the object.
					setting={typeof settings === 'object' ? settings[keyID] : undefined}
					onClick={(evt) => keyFunction(keyID, evt)}
					rowHeight={rowHeight}
					className={`key${keyID}`}
				/>))}
		</div>
	)
}

function getKeyOrder(numRows) {
	return numRows === 1 ?
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', 'ArrowLeft', 'ArrowRight', 'Backspace'] :
		['1', '2', '3', '4', '5', '-', 'Backspace', '6', '7', '8', '9', '0', 'ArrowLeft', 'ArrowRight']
}