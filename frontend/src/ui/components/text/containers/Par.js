import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { startEndMarginFix } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	paragraph: {
		margin: '0.8rem 0',
		padding: '0.05px 0.2rem 0 0',
		...startEndMarginFix('', '0.5rem'),

		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'justify',
		},
	},
}))

export function Par({ children, className, style }) {
	const classes = useStyles()
	return <div className={clsx(classes.paragraph, 'paragraph', className)} style={style}>{children}</div>
}
