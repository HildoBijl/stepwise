import React from 'react'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Container from '@material-ui/core/Container'

import Menu from './Menu'
import Title from './Title'

const useStyles = makeStyles((theme) => ({
	toolbar: {
		padding: 0,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
}))

export default function Header() {
	const theme = useTheme()
	const classes = useStyles()

	return (
		<AppBar position="sticky">
			<Container maxWidth={theme.appWidth}>
				<Toolbar className={classes.toolbar}>
					<Menu className={classes.menuButton} />
					<Title className={classes.title} />
				</Toolbar>
			</Container>
		</AppBar>
	)
}
