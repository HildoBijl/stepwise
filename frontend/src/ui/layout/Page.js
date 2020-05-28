import React from 'react'

import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

import Header from './Header'

const useStyles = makeStyles((theme) => ({
	page: {
		marginTop: theme.spacing(2),
	},
}))

function Page({ children }) {
	const theme = useTheme()
	const classes = useStyles()

	return (
		<>
			<Header />
			<Container maxWidth={theme.appWidth} className={classes.page}>
				{children}
			</Container>
		</>
	)
}

export default Page
