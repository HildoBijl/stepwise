import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container, Typography } from '@material-ui/core'

import { getIcon } from '../theme'

const useStyles = makeStyles((theme) => ({
	notificationBar: {
		background: ({ type }) => theme.palette[type].main,
		boxShadow: theme.shadows[2],
		color: ({ type }) => theme.palette[type].contrastText,
		padding: `${theme.spacing(1.5)}px 0`,

		'& .container': {
			alignItems: 'center',
			display: 'flex',
			flexFlow: 'row nowrap',

			'& .icon': {
				flex: '0 0 auto',
				display: 'inline-flex',
				minWidth: `${theme.spacing(6)}px`,
			},
			'& .text': {
				flex: '1 1 auto',
			},
		},
	},
}))

export default function NotificationBar({ display, type, children }) {
	const theme = useTheme()
	const classes = useStyles({ type })

	if (!display)
		return null

	const Icon = getIcon(type)
	return (
		<div className={classes.notificationBar}>
			<Container maxWidth={theme.appWidth} className="container">
				<div className="icon">{Icon ? <Icon /> : null}</div>
				<div className="text"><Typography>{children}</Typography></div>
			</Container>
		</div>
	)
}
