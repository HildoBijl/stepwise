import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'
import { fade } from '@material-ui/core/styles/colorManipulator'

import OfflineNotification from 'ui/components/OfflineNotification'
import RecommendLogIn from 'ui/components/RecommendLogIn'
import FieldController from 'ui/form/FieldController'
import { useRoute } from 'ui/routing'

import Header from './Header'

const useStyles = makeStyles((theme) => ({
	page: {
		marginTop: theme.spacing(2),

		'& a': {
			color: fade(theme.palette.text.primary, 0.6),
			fontWeight: 600,
			textDecoration: 'none',

			'&:hover': {
				color: theme.palette.text.primary,
			},
		},
	},
}))

export default function Page() {
	// Determine the contents.
	let result = <Contents />

	// Iterate over all parents to provide all Providers.
	let route = useRoute()
	while (route !== null) {
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
		return <route.component />
	return (
		<FieldController>
			<Header Indicator={route.Indicator} />
			<OfflineNotification />
			<RecommendLogIn recommend={route.recommendLogIn} />
			{route.Notification ? <route.Notification /> : null}
			<Container maxWidth={theme.appWidth} className={classes.page}>
				<route.component />
			</Container>
		</FieldController>
	)
}
