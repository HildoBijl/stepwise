import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx'

import { notSelectable } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	tab: {
		...notSelectable,
		alignItems: 'center',
		background: ({ active }) => active ? theme.palette.primary.main : theme.palette.primary.light,
		cursor: 'pointer',
		display: 'flex',
		flexFlow: 'row nowrap',
		height: '100%',
		justifyContent: 'center',
		margin: '0 0.65rem', // For in-between tabs.
		padding: '0 0.5rem',
		position: 'relative',
		zIndex: ({ active }) => active ? 2 : 1,

		'&:hover': {
			background: theme.palette.primary.main,
			zIndex: 2,
			// ToDo: use this color, or the light one, for inactive tabs.
		},

		'& .leftEdge': {
			background: 'inherit',
			borderRadius: '0.6rem 0 0 0',
			height: '100%',
			position: 'absolute',
			left: '-0.6rem',
			top: 0,
			transform: 'skewX(-8deg)',
			width: '1rem',
			zIndex: -1,
		},
		'& .rightEdge': {
			background: 'inherit',
			borderRadius: '0 0.6rem 0 0',
			height: '100%',
			position: 'absolute',
			right: '-0.6rem',
			top: 0,
			transform: 'skewX(8deg)',
			width: '1rem',
			zIndex: -1,
		},
	},
}))

export default function Tab({ children, active, onClick }) {
	const classes = useStyles({ active })
	return (
		<div className={clsx(classes.tab, 'tab')} onClick={onClick}>
			<div className='leftEdge' />
			<div className='rightEdge' />
			{children}
		</div>
	)
}