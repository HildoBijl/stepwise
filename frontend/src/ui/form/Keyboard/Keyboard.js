import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { Box, useTheme, Paper, Container } from '@mui/material'
import { Keyboard as KeyboardIcon } from '@mui/icons-material'

import { usePrevious, useCurrentOrPrevious } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

import { Arrow } from 'ui/components'

import { keyboards } from './keyboards'
import { useKeyboardOpening, useKeyboardTabbing, useKeyboardPositioning } from './handlers'
import { Tab } from './Tab'

export const Keyboard = forwardRef(({ settings, keyFunction }, ref) => {
	// Check the current activity and settings.
	const previousSettings = usePrevious(settings)
	const active = !!settings
	settings = active ? settings : previousSettings // On an inactive keyboard, use the previous settings. This allows us to show the previous tabs while the keyboard is sliding down into hiding.

	// Define references to track the various parts of the keyboard.
	const barRef = useRef()
	const tabsRef = useRef()
	const keyboardRef = useRef()
	const fillerRef = useRef()

	// Use handlers to arrange opening/closing of the keyboard, tabbing and vertical positioning.
	const [open, setOpen] = useKeyboardOpening()
	const [tab, setTab, activeTabs] = useKeyboardTabbing(settings)
	useKeyboardPositioning(tab, barRef, tabsRef, keyboardRef, fillerRef, active, open)

	// Set up an activation handler.
	const activate = (tab) => {
		setTab(tab)
		setOpen(true)
	}

	// Determine the keyboard Layout and corresponding layout settings. Note: when the settings vanish, most likely because the input field is deactivated, keep the previous settings, so things still look good while the keyboard is sliding down.
	const Layout = tab ? keyboards[tab].Layout : null
	let layoutSettings = settings && tab ? settings[tab] : null
	layoutSettings = useCurrentOrPrevious(layoutSettings)

	// Provide an API for objects using the keyboard ref.
	useImperativeHandle(ref, () => ({
		get bar() {
			return barRef.current
		},
		get keyboard() {
			return keyboardRef.current
		},
		contains(obj) { // Used for checking if an event target is inside the keyboard.
			return barRef.current.contains(obj)
		},
		setTab(tab) { // Used for input fields to force a certain tab to open. Although normally this is done through the Field Registration, by changing the keyboard settings there.
			setTab(tab)
		},
	}))

	// Render the Keyboard.
	const theme = useTheme()
	return <>
		<Paper ref={barRef} elevation={12} square={true} sx={{
			background: theme.palette.primary.main,
			bottom: '-1000rem', // To make sure the tabs are hidden on page load.
			color: theme.palette.primary.contrastText,
			height: 0,
			left: 'auto',
			position: 'fixed',
			right: 0,
			top: 'auto', // To override Material UI style settings.
			transition: `height ${theme.transitions.duration.standard}ms, bottom ${theme.transitions.duration.standard}ms`,
			width: '100%',
			zIndex: 1000,
		}}>
			<Container maxWidth={theme.appWidth}>
				<Box sx={{
					height: 0,
					position: 'relative',
					width: '100%',
					zIndex: -1, // Put the tabs behind the keyboard.
				}}>
					<Box ref={tabsRef} sx={{
						bottom: -1, // This should be 0, but the tabs are moved down one pixel to prevent layout bugs on smartphones.
						display: 'flex',
						flexFlow: 'row nowrap',
						height: '2.2rem',
						right: 0,
						padding: '0 0.4rem', // For separation from the side of the page.
						position: 'absolute',
						transition: `bottom ${theme.transitions.duration.standard}ms`,
					}}>
						{activeTabs.length === 1 ? null : activeTabs.map(currTab => {
							const TabIcon = keyboards[currTab].Tab
							return <Tab
								key={currTab}
								active={open && currTab === tab}
								onClick={() => activate(currTab)}
							>
								<TabIcon />
							</Tab>
						})}
						<Tab onClick={() => setOpen(!open)}>
							<KeyboardIcon />
							<Arrow sx={{ transform: `translateX(2px) rotate(${open ? 90 : -90}deg)`, transition: `transform ${theme.transitions.duration.standard}ms` }} />
						</Tab>
					</Box>
				</Box>
				<Box ref={keyboardRef} sx={{ background: theme.palette.primary.main, padding: '0.5rem 0' }}>
					{Layout ?
						<Layout settings={layoutSettings} keyFunction={keyFunction} keySettings={settings && settings.keySettings} />
						: null}
				</Box>
			</Container>
		</Paper>
		<Box ref={fillerRef} sx={{ transition: `height ${theme.transitions.duration.standard}ms` }} />
	</>
})
