import React from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
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
	head: {
		fontWeight: '500',
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
	subhead: {
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
	},
	list: {
		margin: '0.5rem 0',

		'& .item': {
			margin: '0.2rem 0 0.2rem -1rem',
		},
	},
}))

export function Par({ children, className, style }) {
	const classes = useStyles()
	return <div className={clsx(classes.paragraph, 'paragraph', className)} style={style}>{children}</div>
}

export function Head({ children, className, style }) {
	const classes = useStyles()
	return <Typography variant="h5" className={clsx(classes.head, 'head', className)} style={style}>{children}</Typography>
}

export function SubHead({ children, className, style }) {
	const classes = useStyles()
	return <Typography variant="h6" className={clsx(classes.subhead, 'subhead', className)} style={style}>{children}</Typography>
}

export function List({ items, className, style }) {
	const classes = useStyles()
	return <ul className={clsx(classes.list, 'list', className)} style={style}>{items.map((item, index) => <li key={index} className="item">{item}</li>)}</ul>
}
