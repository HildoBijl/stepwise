import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
	list: {
		margin: '0.5rem 0',

		'& .item': {
			margin: '0.2rem 0 0.2rem -1rem',
		},
	},
}))

export default function List({ items, useNumbers, className, style }) {
	const classes = useStyles()
	className = clsx(classes.list, 'list', className)
	const properties = { className, style }
	const contents = items.map((item, index) => <li key={index} className="item">{item}</li>)
	return useNumbers ? <ol {...properties}>{contents}</ol> : <ul {...properties}>{contents}</ul>
}
