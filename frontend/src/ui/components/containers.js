import React from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	paragraph: {
		margin: '1rem 0',
		padding: '0.05px 0.2rem 0 0',
		...startEndMarginFix('', '0.5rem'),
		
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'justify',
		},
	},
	head: {
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
	subhead: {
		margin: '1rem 0',
		padding: '0.05px 0',
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

export function SubHead({ children, className }) {
	const classes = useStyles()
	return <Typography variant="h6" className={clsx(classes.subhead, 'subhead', className)}>{children}</Typography>
}