import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { useCursorRef } from 'ui/form'
import { useActive } from 'ui/inputs'

const useStyles = makeStyles(() => ({
	cursorContainer: {
		height: 0,
		width: 0,

		'& span.cursor': {
			animation: '$cursor 1s linear infinite',
			background: '#000',
			height: '50%',
			position: 'absolute',
			top: '23%',
			width: '1px',
		},
	},

	'@keyframes cursor': {
		'0%': { opacity: 1 },
		'30%': { opacity: 0 },
		'50%': { opacity: 0 },
		'80%': { opacity: 1 },
	},
}))

export const InlineCursor = forwardRef((_, parentRef) => {
	const formRef = useCursorRef()
	const internalRef = useRef()
	const classes = useStyles()

	// Set up handles for control.
	const imperativeHandleFunction = () => ({
		get type() {
			return 'inline'
		},
		get element() {
			return internalRef.current
		},
	})
	useImperativeHandle(parentRef, imperativeHandleFunction)
	useImperativeHandle(formRef, imperativeHandleFunction)

	// If the surrounding input field is not active, do not show anything.
	const active = useActive()
	if (!active)
		return null

	// Render the cursor.
	return <span ref={internalRef} className={clsx(classes.cursorContainer, 'cursorContainer')}>
		<span className="cursor" />
	</span>
})
