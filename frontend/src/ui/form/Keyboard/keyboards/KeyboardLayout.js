import React, { useRef } from 'react'
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

export default function KeyboardLayout({ settings, keyFunction, keys, numColumns, numRows, styles }) {
	// Determine the row height.
	const keyboardLayoutRef = useRef()
	const width = useWidthTracker(keyboardLayoutRef)
	const rowHeight = width / numColumns
	const classes = useStyles({ rowHeight, numColumns, numRows, settings, styles })

	// ToDo: implement styles.

	return (
		<div ref={keyboardLayoutRef} className={clsx(classes.keyboardLayout, 'keyboardLayout')}>
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
