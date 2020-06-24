import React, { useEffect, useState, useCallback } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container, Typography } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
	offlineNotification: {
		background: theme.palette.warning.main,
		color: theme.palette.info.contrastText,
		padding: `${theme.spacing(1)}px 0`,
	},
}))

export default function OfflineNotification() {
	const theme = useTheme()
	const classes = useStyles()

	// Set up a boolean state parameter that is updated when the user goes online/offline.
	const [online, setOnline] = useState(navigator.onLine)
	const updateStatus = useCallback(() => setOnline(navigator.onLine), [])
	useEffect(() => {
		window.addEventListener('online', updateStatus)
		window.addEventListener('offline', updateStatus)
		return () => {
			window.removeEventListener('online', updateStatus)
			window.removeEventListener('offline', updateStatus)
		}
	}, [updateStatus])

	// Only display the notification when the user is offline. 
	if (online)
		return null
	return (
		<div className={classes.offlineNotification}>
			<Container maxWidth={theme.appWidth}>
				<Typography>You seem to have lost your internet connection. Some functionalities will fail to work until you're back online.</Typography>
			</Container>
		</div>
	)
}
