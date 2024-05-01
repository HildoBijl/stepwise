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

export function List({ items, useNumbers, className, style }) {
	if (!items || !Array.isArray(items))
		throw new Error(`Invalid list items: expected an array "items" property, but received something of type ${typeof items}.`)
	const classes = useStyles()
	className = clsx(classes.list, 'list', className)
	const properties = { className, style }
	const contents = items.map((item, index) => <li key={index} className="item">{item}</li>)
	return useNumbers ? <ol {...properties}>{contents}</ol> : <ul {...properties}>{contents}</ul>
}
List.translatableProps = 'items'
