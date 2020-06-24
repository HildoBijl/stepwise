import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import Header from './Header'
import OfflineNotification from '../components/OfflineNotification'
import { useRoute } from '../routing'

const useStyles = makeStyles((theme) => ({
	page: {
		marginTop: theme.spacing(2),
	},
}))

export default function Page() {
	const route = useRoute()

	// If a context and query have been provided, incorporate them.
	if (route.provider)
		return <route.provider><Contents /></route.provider>
	return <Contents />
}

function Contents() {
	const route = useRoute()
	const theme = useTheme()
	const classes = useStyles()

	// Full page components don't get a header/container, while regular pages do.
	if (route.fullPage)
		return <route.component />
	return (
		<>
			<Header />
			<OfflineNotification />
			<Container maxWidth={theme.appWidth} className={classes.page}>
				<route.component />
			</Container>
		</>
	)
}
