import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import clsx from 'clsx'

import { notSelectable } from 'ui/theme'

import KeyIcon from './KeyIcon'

const useStyles = makeStyles((theme) => ({
	keyButton: {
		...notSelectable,
		background: theme.palette.primary.light,
		color: theme.palette.primary.contrastText,
		cursor: 'pointer',
		alignItems: 'center',
		display: 'flex',
		flexFlow: 'row nowrap',
		height: '100%',
		justifyContent: 'center',
		width: '100%',

		'&:active': {
			background: theme.palette.primary.dark,
		},

		'&.disabled': {
			background: theme.palette.primary.dark,
			color: theme.palette.primary.main,
			cursor: 'auto',
		},
		'&.hidden': {
			visibility: 'hidden',
		},

		'& svg': {
			display: 'block',
			height: '100%',
			overflow: 'visible',
			width: '100%',

			'& text': {
				fill: 'currentColor',
			},
		},

		'&.secondary': {
			background: theme.palette.secondary.main,
			'&:active': {
				background: theme.palette.secondary.dark,
			},
			'&.disabled': {
				background: theme.palette.secondary.dark,
				color: theme.palette.secondary.main,
				cursor: 'auto',
			},
		},
	},
}))

export default function KeyButton({ keyID, className, setting, onClick, properties }) {
	const disabled = (setting === false)
	const classes = useStyles()
	return (
		<Paper className={clsx(classes.keyButton, 'keyButton', className, setting, { disabled })} elevation={4} onClick={disabled ? null : onClick}>
			<KeyIcon keyID={keyID} properties={properties} />
		</Paper>
	)
}
