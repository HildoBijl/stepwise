import React from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { SwipeableDrawer, List, Divider, IconButton } from '@material-ui/core'
import { Menu as MenuIcon, Home, School, Feedback, Info } from '@material-ui/icons'

import MenuLink from './MenuLink'
import routes from '../routes'

const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent) // To fix the SwipeableDrawer on iOS.

const useStyles = makeStyles((theme) => ({
	menu: {
		width: 250,
	},
}))

export default function Menu({ className }) {
	const classes = useStyles()
	const [open, setOpen] = React.useState(false)
	const history = useHistory()

	const toggleDrawer = (open) => (event) => {
		// If a tab (with/without shift) or enter was pressed, process this.
		if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift'))
			return // Don't close as usual on a keypress.
		if (event && event.type === 'keydown' && event.key === 'Enter')
			history.push(event.target.pathname) // Go to the respective page.

		// Process the opening/closing.
		setOpen(open)
	}

	return (
		<>
			<IconButton edge="start" className={className} color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
				<MenuIcon />
			</IconButton>
			<SwipeableDrawer anchor='left' open={open} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)} ModalProps={{ keepMounted: true }} disableBackdropTransition={!iOS} disableDiscovery={iOS}>
				<nav className={classes.menu} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
					<List>
						<MenuLink path={routes.home} text='Home' icon={Home} />
					</List>
					<Divider />
					<List>
						<MenuLink path={routes.exercises} text='Exercises' icon={School} />
						<MenuLink path={routes.feedback} text='Feedback' icon={Feedback} />
						<MenuLink path={routes.about} text='About' icon={Info} />
					</List>
				</nav>
			</SwipeableDrawer>
		</>
	)
}
