import React from 'react'
import { Paper } from '@mui/material'
import clsx from 'clsx'

import { notSelectable } from 'ui/theme'

import KeyIcon from './KeyIcon'

export function KeyButton({ keyID, className, setting, onClick, properties, style = {} }) {
	const disabled = (setting === false)
	return <Paper className={clsx('keyButton', className, setting, { disabled })} elevation={4} onClick={disabled ? null : onClick} sx={theme => ({
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
		...style,

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
	})}>
		<KeyIcon keyID={keyID} properties={properties} />
	</Paper>
}
