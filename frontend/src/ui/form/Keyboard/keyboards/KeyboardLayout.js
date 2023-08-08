import React, { useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { resolveFunctions } from 'step-wise/util'

import { useSize } from 'util/react'

import { useButtonClickFunction } from './util'
import KeyButton from './KeyButton'

const useStyles = makeStyles((theme) => ({
	keyboardLayout: ({ rowHeight, numColumns, numRows, settings, styles, maxWidth }) => {
		// Process and include extra styles.
		styles = resolveFunctions(styles, { rowHeight, numColumns, numRows, settings })
		if (!styles || typeof styles !== 'object')
			styles = {}

		return {
			display: 'grid',
			gap: `${rowHeight * 0.1}px`,
			gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
			gridTemplateRows: `repeat(${numRows}, 1fr)`,
			margin: '0.4rem auto',
			maxWidth: maxWidth ? `${maxWidth}px` : 'none',

			'& .keyButton': {
				borderRadius: `${rowHeight * 0.15}px`,
				height: `${rowHeight * 0.9}px`, // Not the full height because of the gap.
				padding: `${rowHeight * 0.15}px`,
			},

			...styles,
		}
	},
}))

export default function KeyboardLayout({ settings, keyFunction, keySettings = {}, keys, numColumns, numRows, styles, widthToRowHeight, maxWidth, keyClassNames = {} }) {
	// Determine the row height.
	const keyboardLayoutRef = useRef()
	const [width] = useSize(keyboardLayoutRef)
	const rowHeight = widthToRowHeight ? widthToRowHeight(width) : width / numColumns
	const classes = useStyles({ rowHeight, numColumns, numRows, settings, styles, maxWidth })
	const [buttonClickFunction, properties] = useButtonClickFunction(keyFunction)

	// Check which keys are needed.
	keys = resolveFunctions(keys, properties)

	return (
		<div ref={keyboardLayoutRef} className={clsx(classes.keyboardLayout, 'keyboardLayout')}>
			{keys.map(keyID => (
				<KeyButton
					key={keyID} // For React.
					keyID={keyID} // To pass to the object.
					setting={keySettings[keyID]}
					onClick={(evt) => buttonClickFunction(keyID, evt)}
					rowHeight={rowHeight}
					className={clsx(`key${keyID}`, keyClassNames[keyID])}
					properties={properties}
				/>))}
		</div>
	)
}
