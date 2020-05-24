import React from 'react'

import { useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'

import Header from './Header'

function Page({ children }) {
	const theme = useTheme()
	return (
		<>
			<Header />
			<Container maxWidth={theme.appWidth}>
				{children}
			</Container>
		</>
	)
}

export default Page
