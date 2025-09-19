import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Box } from '@mui/material'

import { useInputData } from '../../../Input'

export const AbsoluteCursor = forwardRef((_, parentRef) => {
	const { active, cursorRef: fieldCursorRef } = useInputData()
	const internalRef = useRef()
	const [properties, setProperties] = useState()

	// Set up handles for control.
	const imperativeHandleFunction = () => ({
		get type() {
			return 'absolute'
		},
		get element() {
			return internalRef.current
		},
		get properties() {
			return properties
		},
		show(properties) {
			setProperties(properties)
		},
		hide() {
			setProperties(undefined)
		},
	})
	useImperativeHandle(parentRef, imperativeHandleFunction)
	useImperativeHandle(fieldCursorRef, imperativeHandleFunction)

	// Render the cursor.
	return <Box component="span" ref={internalRef} className="cursor" sx={{
		animation: '$cursor 1s linear infinite',
		background: '#000',
		position: 'absolute',
		width: '1px',
		display: active && properties ? 'block' : 'none',
		height: properties?.height ?? 0,
		left: properties?.left ?? 0,
		top: properties?.top ?? 0,
		'@keyframes cursor': {
			'0%': { opacity: 1 },
			'30%': { opacity: 0 },
			'50%': { opacity: 0 },
			'80%': { opacity: 1 },
		},
	}} />
})
