import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { Box } from '@mui/material'

import { useInputData } from '../../../Input'

export const InlineCursor = forwardRef((_, parentRef) => {
	const { active, cursorRef: fieldCursorRef } = useInputData()
	const internalRef = useRef()

	// Set up handles for control.
	const imperativeHandleFunction = () => ({
		get type() { return 'inline' },
		get element() { return internalRef.current },
	})
	useImperativeHandle(parentRef, imperativeHandleFunction)
	useImperativeHandle(fieldCursorRef, imperativeHandleFunction)

	// If the surrounding input field is not active, do not show anything.
	if (!active)
		return null

	// Render the cursor.
	return <Box component="span" className="cursorContainer" ref={internalRef} sx={{
		visibility: active ? 'visible' : 'hidden',
		height: 0,
		width: 0,
	}}>
		<Box component="span" className="cursor" sx={{
			animation: '$cursor 1s linear infinite',
			background: '#000',
			height: '50%',
			position: 'absolute',
			top: '23%',
			width: '1px',
			'@keyframes cursor': {
				'0%': { opacity: 1 },
				'30%': { opacity: 0 },
				'50%': { opacity: 0 },
				'80%': { opacity: 1 },
			},
		}} />
	</Box>
})
