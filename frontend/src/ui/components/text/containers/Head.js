import React from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	head: {
		fontWeight: '500',
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
}))

export default function Head({ children, className, style }) {
	const classes = useStyles()
	return <>
		<Typography variant="h5" className={clsx(classes.head, 'head', className)} style={style}>
			{children}
		</Typography>
	</>
}
