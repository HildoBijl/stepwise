import React from 'react'
import { Container, AppBar, useTheme } from '@mui/material'

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
