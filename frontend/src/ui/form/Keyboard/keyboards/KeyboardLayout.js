import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { useWidthTracker } from 'util/react'

import KeyButton from './KeyButton'

const useStyles = makeStyles((theme) => ({
	keyboardLayout: ({ rowHeight, numColumns, numRows, settings, styles }) => {
		// Process and include extra styles.
		if (typeof styles === 'function')
			styles = styles({ rowHeight, numColumns, numRows, settings })
		if (!styles || typeof styles !== 'object')
			styles = {}

		return {
			display: 'grid',
			gap: `${rowHeight * 0.1}px`,
			gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
			gridTemplateRows: `repeat(${numRows}, 1fr)`,
			margin: '0.4rem 0',

			'& .keyButton': {
				borderRadius: `${rowHeight * 0.15}px`,
				height: `${rowHeight * 0.9}px`, // Not the full height because of the gap.
				padding: `${rowHeight * 0.15}px`,
			},

			...styles,
		}
	},
}))

export default function KeyboardLayout({ settings, keyFunction, keys, numColumns, numRows, styles, widthToRowHeight }) {
	// Determine the row height.
	const keyboardLayoutRef = useRef()
	const width = useWidthTracker(keyboardLayoutRef, true)
	const rowHeight = widthToRowHeight ? widthToRowHeight(width) : width / numColumns
	const classes = useStyles({ rowHeight, numColumns, numRows, settings, styles })
	const [buttonClickFunction, properties] = useButtonClickFunction(keyFunction)

	// Check which keys are needed.
	if (typeof keys === 'function')
		keys = keys(properties)

	return (
		<div ref={keyboardLayoutRef} className={clsx(classes.keyboardLayout, 'keyboardLayout')}>
			{keys.map(keyID => (
				<KeyButton
					key={keyID} // For React.
					keyID={keyID} // To pass to the object.
					setting={typeof settings === 'object' ? settings[keyID] : undefined}
					onClick={(evt) => buttonClickFunction(keyID, evt)}
					rowHeight={rowHeight}
					className={`key${keyID}`}
					properties={properties}
				/>))}
		</div>
	)
}

function useButtonClickFunction(keyFunction) {
	// Set up states for various keys.
	const [shift, setShift] = useState(false)

	// Set up the button click function for each possible keyID.
	const buttonClickFunction = (keyID, evt) => {
		switch (keyID) {
			case 'Shift':
				setShift(shift => !shift)
				return
			default: // Regular key.
				setShift(false)
				return keyFunction({ key: keyID, shift }, evt)
		}
	}

	// Return the button click function and the parameters.
	return [buttonClickFunction, { shift }]
}