import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme, Box, SwipeableDrawer, List, Divider, IconButton, useMediaQuery } from '@mui/material'
import { Menu as MenuIcon, ArrowBack, Home, MenuBook, Info, ExitToApp, Policy, SupervisorAccount, Settings, People } from '@mui/icons-material'

import { useUser, isAdmin } from 'api'
import { TranslationSection } from 'i18n'
import { usePaths, useParentPath } from 'ui/routingTools'
import { Student, Teacher } from 'ui/components'
import { useFieldRegistration, useFieldControllerContext } from 'ui/form'

import MenuLink from './MenuLink'

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document) // To fix the SwipeableDrawer on iOS.

export default function Menu({ titleCollapsed, sx }) {
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
			<MenuLink id="forStudents" icon={Student} />
			<MenuLink id="forTeachers" icon={Teacher} />
			<MenuLink id="about" icon={Info} />
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
			<IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} ref={menuButtonRef} sx={sx}>
				<MenuIcon />
			</IconButton>
			<SwipeableDrawer anchor='left' open={open} onClose={toggleDrawer(false)} onOpen={toggleDrawer(true)} ModalProps={{ keepMounted: true }} disableBackdropTransition={!iOS} disableDiscovery={iOS}>
				<Box component="nav" role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)} sx={{ width: 250 }}>
					{user ? <>
						<List>
							<MenuLink id="courses" icon={MenuBook} />
							<MenuLink id="groups" icon={People} />
							<MenuLink id="settings" path={paths.settings()} icon={Settings} />
							<MenuLink id="logOut" text='Log out' icon={ExitToApp} />
							<Divider />
							{commonButtons}
						</List>
						{adminButtons}
					</> : <>
						<List>
							<MenuLink id="home" icon={Home} />
							{commonButtons}
						</List>
					</>}
				</Box>
			</SwipeableDrawer>
		</TranslationSection>
	} else {
		const goToParent = () => navigate(parentPath)
		return (
			<IconButton edge="start" color="inherit" aria-label="menu" onClick={goToParent} ref={menuButtonRef} sx={sx}>
				<ArrowBack />
			</IconButton>
		)
	}
}
