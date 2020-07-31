import React, { useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { SwipeableDrawer, List, Divider, IconButton } from '@material-ui/core'
import { Menu as MenuIcon, Add, Clear, Dialpad, Home, School, Create, Feedback, Info, MenuBook, ExitToApp } from '@material-ui/icons'

import { useFieldControl, useFieldControllerContext } from './FieldController'
import MenuLink from './MenuLink'
import { usePaths } from '../routing'
import { useUser } from '../api/user'

const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent) // To fix the SwipeableDrawer on iOS.

const useStyles = makeStyles((theme) => ({
	menu: {
		width: 250,
	},
}))

export default function Menu({ className }) {
	const classes = useStyles()
	const [open, setOpen] = useState(false)
	const history = useHistory()
	const paths = usePaths()
	const user = useUser()

	// Include the menu button in the tabbing.
	const menuButtonRef = useRef()
	useFieldControl({ id: 'menuButton', ref: menuButtonRef, focusRefOnActive: true, manualIndex: 1}) // Put the tab index at the end.

	// Deactivate the usual tab control when the menu is open.
	const { turnTabbingOn, turnTabbingOff } = useFieldControllerContext()
	useEffect(() => {
		open ? turnTabbingOff() : turnTabbingOn()
	}, [open, turnTabbingOn, turnTabbingOff])

	// Set up a toggleDrawer event handler to open/close the drawer.
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
			<IconButton edge="start" className={className} color="inherit" aria-label="menu" onClick={toggleDrawer(true)} ref={menuButtonRef}>
				<MenuIcon />
			</IconButton>
			<SwipeableDrawer anchor='left' open={open} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)} ModalProps={{ keepMounted: true }} disableBackdropTransition={!iOS} disableDiscovery={iOS}>
				<nav className={classes.menu} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
					<List>
						{user ? <MenuLink path={paths.courses()} text='Courses' icon={School} /> : <MenuLink path={paths.home()} text='Home' icon={Home} />}
					</List>
					<Divider />
					<List>
						<MenuLink path={paths.feedback()} text='Feedback' icon={Feedback} />
						<MenuLink path={paths.about()} text='About' icon={Info} />
						<MenuLink path={paths.history()} text='History' icon={MenuBook} />
						<MenuLink path={paths.skill({ skillId: 'fillInInteger' })} text='Oefen met getallen invullen' icon={Dialpad} />
						<MenuLink path={paths.skill({ skillId: 'summation' })} text='Oefen optellen' icon={Add} />
						<MenuLink path={paths.skill({ skillId: 'multiplication' })} text='Oefen vermenigvuldigen' icon={Clear} />
						<MenuLink path={paths.skill({ skillId: 'summationAndMultiplication' })} text='Oefen optellen en vermenigvuldigen' icon={Create} />
						{user ? <MenuLink path={paths.logOut()} text='Log out' icon={ExitToApp} /> : null}
					</List>
				</nav>
			</SwipeableDrawer>
		</>
	)
}
