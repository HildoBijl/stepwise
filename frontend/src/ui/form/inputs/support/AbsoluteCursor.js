import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { useAbsoluteCursorRef } from '../../Form'

const useStyles = makeStyles(() => ({
	cursor: {
		animation: '$cursor 1s linear infinite',
		background: '#000',
		position: 'absolute',
		width: '1px',
	},

	cursorPositioned: (properties) => ({
		display: properties ? 'block' : 'none',
		height: properties ? properties.height : 0,
		left: properties ? properties.left : 0,
		top: properties ? properties.top : 0,
	}),

	'@keyframes cursor': {
		'0%': { opacity: 1 },
		'30%': { opacity: 0 },
		'50%': { opacity: 0 },
		'80%': { opacity: 1 },
	},
}))

function AbsoluteCursor({ active }, parentRef) {
	const formRef = useAbsoluteCursorRef(active)
	const internalRef = useRef()
	const [properties, setProperties] = useState()
	const classes = useStyles(active && properties)

	const imperativeHandleFunction = () => ({
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
	useImperativeHandle(formRef, imperativeHandleFunction)

	return (
		<span ref={internalRef} className={clsx(classes.cursor, classes.cursorPositioned, 'cursor')} />
	)
}
export default forwardRef(AbsoluteCursor)