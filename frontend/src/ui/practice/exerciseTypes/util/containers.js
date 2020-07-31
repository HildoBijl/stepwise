import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from '../../../theme'

const useStyles = makeStyles((theme) => ({
	paragraph: {
		margin: `1em 0`,
		padding: '0.05px',
		...startEndMarginFix(),
	},
}))

export function Par({ children, className }) {
	const classes = useStyles()
	return <div className={clsx(classes.paragraph, 'paragraph', className)}>{children}</div>
}