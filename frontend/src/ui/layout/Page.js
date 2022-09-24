import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import { linkStyle } from 'ui/theme'
import { useRoute } from 'ui/routing'
import ModalManager from 'ui/components/Modal/ModalManager'
import OfflineNotification from 'ui/components/notifications/OfflineNotification'
import RecommendLogIn from 'ui/components/notifications/RecommendLogIn'
import FieldController from 'ui/form/FieldController'

import Header from './Header'

const useStyles = makeStyles((theme) => ({
	page: {
		marginTop: theme.spacing(2),
		paddingBottom: '0.5rem', // Use padding to ensure that bottom elements inside this page can show their margin.

		'& a': {
			...linkStyle,
		},
	},
}))

export default function Page() {
	// Determine the contents.
	let result = <Contents />

	// Iterate over all parents to provide all Providers.
	let route = useRoute()
	while (route !== undefined) {
		if (route.Provider)
			result = <route.Provider>{result}</route.Provider>
		route = route.parent
	}

	// All done!
	return result
}

function Contents() {
	const route = useRoute()
	const theme = useTheme()
	const classes = useStyles()

	// Full page components don't get a header/container, while regular pages do.
	if (route.fullPage)
		return (
			<FieldController>
				<ModalManager>
					<route.component />
				</ModalManager>
			</FieldController>
		)
	return (
		<FieldController>
			<ModalManager>
				<Header Indicator={route.Indicator} />
				<OfflineNotification />
				<RecommendLogIn recommend={route.recommendLogIn} />
				{route.Notification ? <route.Notification /> : null}
				<Container maxWidth={theme.appWidth} className={classes.page}>
					<route.component />
				</Container>
			</ModalManager>
		</FieldController>
	)
}
