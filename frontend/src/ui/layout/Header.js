import React, { useState } from 'react'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Container from '@material-ui/core/Container'

import GroupIndicator from 'ui/pages/Groups/Indicator'

import Menu from './Menu'
import Title from './Title'
import { TabBar } from './tabs'

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

export default function Header({ Indicator }) {
	const theme = useTheme()
	const classes = useStyles()
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
			<TabBar />
		</AppBar>
	)
}
