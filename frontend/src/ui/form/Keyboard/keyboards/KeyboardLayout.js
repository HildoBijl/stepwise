import React, { useRef } from 'react'
import { Box } from '@mui/material'
import clsx from 'clsx'

import { resolveFunctions } from 'step-wise/util'

import { useSize } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

import { useButtonClickFunction } from './util'
import { KeyButton } from './KeyButton'

export function KeyboardLayout({ settings, keyFunction, keySettings = {}, keys, numColumns, numRows, styles, widthToRowHeight, maxWidth, keyClassNames = {} }) {
	// Determine the row height.
	const keyboardLayoutRef = useRef()
	const [width] = useSize(keyboardLayoutRef)
	const rowHeight = widthToRowHeight ? widthToRowHeight(width) : width / numColumns
	const [buttonClickFunction, properties] = useButtonClickFunction(keyFunction)

	// Process the styles that were given.
	styles = resolveFunctions(styles, { rowHeight, numColumns, numRows, settings })
	if (!styles || typeof styles !== 'object')
		styles = {}

	// Check which keys are needed.
	keys = resolveFunctions(keys, properties)
	return (
		<Box ref={keyboardLayoutRef} sx={{
			display: 'grid',
			gap: `${rowHeight * 0.1}px`,
			gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
			gridTemplateRows: `repeat(${numRows}, 1fr)`,
			margin: '0.4rem auto',
			maxWidth: maxWidth ? `${maxWidth}px` : 'none',
			...styles,
		}}>
			{keys.map(keyID => (
				<KeyButton
					key={keyID} // For React.
					keyID={keyID} // To pass to the object.
					setting={keySettings[keyID]}
					onClick={(evt) => buttonClickFunction(keyID, evt)}
					rowHeight={rowHeight}
					className={clsx(`key${keyID}`, keyClassNames[keyID])}
					properties={properties}
					style={{
						borderRadius: `${rowHeight * 0.15}px`,
						height: `${rowHeight * 0.9}px`, // Not the full height because of the gap.
						padding: `${rowHeight * 0.15}px`,
					}}
				/>))}
		</Box>
	)
}
