import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { SwipeableDrawer, List, Divider, IconButton, useMediaQuery } from '@material-ui/core'
import { Menu as MenuIcon, ArrowBack, Home, MenuBook, Feedback, Info, ExitToApp, Policy, SupervisorAccount, Settings, People } from '@material-ui/icons'

import { useUser } from 'api/user'
import { isAdmin } from 'api/admin'
import { TranslationSection } from 'i18n'
import { usePaths, useParentPath } from 'ui/routingTools'
import { useFieldRegistration, useFieldControllerContext } from 'ui/form'

import MenuLink from './MenuLink'

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document) // To fix the SwipeableDrawer on iOS.

const useStyles = makeStyles((theme) => ({
	menu: {
		width: 250,
	},
}))

export default function Menu({ className, titleCollapsed }) {
	const classes = useStyles()
	const [open, setOpen] = useState(false)
	const navigate = useNavigate()
	const paths = usePaths()
	const user = useUser()
	const theme = useTheme()
	const onComputer = useMediaQuery(theme.breakpoints.up('lg'))
	const parentPath = useParentPath()

	// Include the menu button in the tabbing.
	const menuButtonRef = useRef()
	useFieldRegistration({ id: 'menuButton', element: menuButtonRef, focusRefOnActive: true, manualIndex: 1 }) // Put the tab index at the end.

	// Deactivate the usual tab control when the menu is open.
	const { turnTabbingOn, turnTabbingOff } = useFieldControllerContext()
	useEffect(() => {
		open ? turnTabbingOff() : turnTabbingOn()
	}, [open, turnTabbingOn, turnTabbingOff])

	// Most often we show a hamburger menu. But on a deeper page we may show a back button.
	if (onComputer || !titleCollapsed) {
		// Show a menu. First set up a toggleDrawer event handler to open/close the drawer.
		const toggleDrawer = (open) => (event) => {
			// If a tab (with/without shift) or enter was pressed, process this.
			if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift'))
				return // Don't close as usual on a keypress.
			if (event && event.type === 'keydown' && event.key === 'Enter')
				navigate(event.target.pathname) // Go to the respective page.

			// Process the opening/closing.
			setOpen(open)
		}

		// Define buttons common to logged-in and non-logged-in users.
		const commonButtons = <>
			<MenuLink id="info" icon={Info} />
			<MenuLink id="feedback" icon={Feedback} />
		</>

		// Define buttons for admins.
		const adminButtons = isAdmin(user) ? <>
			<Divider />
			<List>
				<MenuLink id="inspect" icon={Policy} />
				<MenuLink id="admin" icon={SupervisorAccount} />
			</List>
		</> : null

		return <TranslationSection entry="menu">
			<IconButton edge="start" className={className} color="inherit" aria-label="menu" onClick={toggleDrawer(true)} ref={menuButtonRef}>
				<MenuIcon />
			</IconButton>
			<SwipeableDrawer anchor='left' open={open} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)} ModalProps={{ keepMounted: true }} disableBackdropTransition={!iOS} disableDiscovery={iOS}>
				<nav className={classes.menu} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
					{user ? <>
						<List>
							<MenuLink id="courses" icon={MenuBook} />
							<MenuLink id="groups" icon={People} />
							{commonButtons}
							<MenuLink id="settings" path={paths.settings()} icon={Settings} />
							<MenuLink id="logOut" text='Log out' icon={ExitToApp} />
						</List>
						{adminButtons}
					</> : <>
						<List>
							<MenuLink id="home" icon={Home} />
							{commonButtons}
						</List>
					</>}
				</nav>
			</SwipeableDrawer>
		</TranslationSection>
	} else {
		const goToParent = () => navigate(parentPath)
		return (
			<IconButton edge="start" className={className} color="inherit" aria-label="menu" onClick={goToParent} ref={menuButtonRef}>
				<ArrowBack />
			</IconButton>
		)
	}
}
