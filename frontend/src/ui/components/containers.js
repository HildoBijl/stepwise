import React from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from '../theme'

const useStyles = makeStyles((theme) => ({
	paragraph: {
		margin: `1rem 0`,
		padding: '0.05px',
		...startEndMarginFix('', '0.5rem'),
	},
	head: {
		margin: `1rem 0`,
		padding: '0.05px',
		...startEndMarginFix('', 0),
	},
}))

export function Par({ children, className }) {
	const classes = useStyles()
	return <div className={clsx(classes.paragraph, 'paragraph', className)}>{children}</div>
}

export function Head({ children, className }) {
	const classes = useStyles()
	return <Typography variant="h5" className={clsx(classes.head, 'head', className)}>{children}</Typography>
}