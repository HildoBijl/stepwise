import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import routes from '../routes'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Container from '@material-ui/core/Container'

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
}))

function Header() {
	const theme = useTheme()
	const classes = useStyles()

	return (
		<AppBar position="sticky">
			<Container maxWidth={theme.appWidth}>
				<Toolbar>
					<IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
						<MenuIcon />
					</IconButton>
					<Typography variant="h6" className={classes.title}>
						News
    			</Typography>
					<Button color="inherit">Login</Button>
				</Toolbar>
			</Container>
		</AppBar>
	)
}

export default Header
