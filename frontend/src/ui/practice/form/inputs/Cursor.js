import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { useCursorRef } from '../Form'

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
			width: '0.5px',
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
	return <span className={clsx(classes.cursorContainer, 'cursorContainer')} ref={cursorRef}><span className="cursor"/></span>
}