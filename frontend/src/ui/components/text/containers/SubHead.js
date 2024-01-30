import React from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	subhead: {
		fontSize: '1.125rem',
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
}))

export function SubHead({ children, className, style }) {
	const classes = useStyles()
	return <Typography variant="h6" className={clsx(classes.subhead, 'subhead', className)} style={style}>{children}</Typography>
}
