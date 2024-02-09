import React from 'react'

import { useTheme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Container from '@material-ui/core/Container'

import { Tabs } from './Tabs'

export function TabBar() {
	const theme = useTheme()
	return (
		<AppBar position="static" color="secondary">
			<Container maxWidth={theme.appWidth}>
				<Tabs />
			</Container>
		</AppBar>
	)
}
