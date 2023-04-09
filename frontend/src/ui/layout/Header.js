import React, { useState } from 'react'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Container from '@material-ui/core/Container'

import { useRoute } from 'ui/routing'
import GroupIndicator from 'ui/pages/Groups/Indicator'

import Menu from './Menu'
import Title from './Title'
import { Tabs } from './tabs'

const useStyles = makeStyles((theme) => ({
	toolbar: {
		padding: 0,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flex: 1,
	},
}))

export default function Header({ routes, Indicator }) {
	const theme = useTheme()
	const classes = useStyles()
	const route = useRoute()
	const [titleCollapsed, setTitleCollapsed] = useState(false)

	return (
		<AppBar position="sticky">
			<Container maxWidth={theme.appWidth}>
				<Toolbar className={classes.toolbar}>
					<Menu className={classes.menuButton} titleCollapsed={titleCollapsed} />
					<Title className={classes.title} setTitleCollapsed={setTitleCollapsed} />
					{Indicator ? <Indicator /> : null}
					<GroupIndicator />
				</Toolbar>
			</Container>
			{route.tabs && <TabBar route={route} />}
		</AppBar>
	)
}

function TabBar({ route }) {
	const theme = useTheme()
	return (
		<AppBar position="static" color="secondary">
			<Container maxWidth={theme.appWidth}>
				<Tabs tabs={route.tabs} />
			</Container>
		</AppBar>
	)
}
