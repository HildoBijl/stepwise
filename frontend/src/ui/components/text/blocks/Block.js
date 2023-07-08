import React from 'react'
import clsx from 'clsx'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	block: {
		margin: '0.8rem 0',
		...startEndMarginFix('', '0.5rem'),

		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'justify',
		},
	},
}))

export default function Info({ type, className, children, ...props }) {
	const classes = useStyles()
	return <Alert severity={type} className={clsx(classes.block, className)} {...props}>{children}</Alert>
}
