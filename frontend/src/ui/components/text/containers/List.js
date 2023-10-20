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
	const classes = useStyles()
	className = clsx(classes.list, 'list', className)
	const properties = { className, style }
	const contents = getListContents(items)
	return useNumbers ? <ol {...properties}>{contents}</ol> : <ul {...properties}>{contents}</ul>
}
List.tag = 'list'

// Set up custom functions for generating/using translation strings, to get easier translation set-ups.
List.getTranslationString = (props, getTranslationString) => getTranslationString(getListContents(props.items))
List.translateProps = (props, tree, applyTranslationTree) => ({
	...props,
	items: (props.items || []).map((item, index) => applyTranslationTree(item, tree[index].value))
})

function getListContents(items) {
	return items.map((item, index) => <ListItem key={index} className="item">{item}</ListItem>)
}

export function ListItem({ children }) {
	return <li>{children}</li>
}
ListItem.tag = 'item'
