import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { useCursorRef } from '../../'

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

function InlineCursor(_, parentRef) {
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

	// Render the cursor.
	return <span ref={internalRef} className={clsx(classes.cursorContainer, 'cursorContainer')}>
		<span className="cursor" />
	</span>
}
export default forwardRef(InlineCursor)
