import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { useCursorRef } from '../Form'

const useStyles = makeStyles(() => ({
	cursorContainer: {
		height: 0,
		width: 0,

		'& .cursor': {
			animation: '$cursor 1s linear infinite',
			background: '#000',
			height: '1.4em',
			position: 'absolute',
			top: '50%',
			transform: 'translateY(-55%)', // 50% to put it in the middle, and a bit extra to move it slightly above the mean line.
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

export default function Cursor() {
	const classes = useStyles()
	const cursorRef = useCursorRef()
	return <span className={classes.cursorContainer} ref={cursorRef}><span className="cursor"/></span>
}