import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import clsx from 'clsx'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import { Keyboard as KeyboardIcon } from '@material-ui/icons'

import { usePrevious, useCurrentOrPrevious, useEventListener } from 'util/react'

import Arrow from 'ui/components/icons/Arrow'

import Tab from './Tab'
import keyboards, { tabs } from './keyboards'

const useStyles = makeStyles((theme) => ({
	keyboardBar: {
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

		'& .tabContainer': {
			height: 0,
			position: 'relative',
			width: '100%',
			zIndex: -1, // Put the tabs behind the keyboard.

			'& .tabs': {
				bottom: -1, // This should be 0, but the tabs are moved down one pixel to prevent layout bugs on smartphones.
				display: 'flex',
				flexFlow: 'row nowrap',
				height: '2.2rem',
				right: 0,
				padding: '0 0.4rem', // For separation from the side of the page.
				position: 'absolute',
				transition: `bottom ${theme.transitions.duration.standard}ms`,
			},
		},
		'& .keyboardArrow': {
			transform: ({ open }) => `translateX(2px) rotate(${open ? 90 : -90}deg)`,
			transition: `transform ${theme.transitions.duration.standard}ms`,
		},
		'& .keyboard': {
			background: theme.palette.primary.main, // Give the keyboard a background too, to allow the tabs to be behind it.
			padding: '0.5rem 0',
		},
	},
	filler: {
		transition: `height ${theme.transitions.duration.standard}ms`,
	},
}))

function Keyboard({ settings, keyFunction }, ref) {
	// When the keyboard is opened or closed, remember this in local storage.
	const [open, setOpen] = useState(!!localStorage && localStorage.getItem('keyboardStatus') === 'open') // Default closed.
	const setAndStoreOpen = useCallback((open) => {
		if (localStorage)
			localStorage.setItem('keyboardStatus', open ? 'open' : 'closed')
		setOpen(open)
	}, [setOpen])

	let [chosenTab, setChosenTab] = useState()
	const previousSettings = usePrevious(settings)
	const active = !!settings

	const theme = useTheme()
	const classes = useStyles({ active, open })
	const barRef = useRef()
	const tabsRef = useRef()
	const keyboardRef = useRef()
	const fillerRef = useRef()

	// Provide API for objects using the keyboard ref.
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
			setChosenTab(tab)
		},
	}))

	// When a different tab is requested by the input field, make sure to show it.
	const requestedTab = settings && settings.tab
	useEffect(() => {
		if (requestedTab) {
			if (!tabs.includes(requestedTab))
				throw new Error(`Invalid keyboard tab: tried to use a keyboard tab "${requestedTab}" but this tab does not exist.`)
			setChosenTab(requestedTab)
		}
	}, [requestedTab])

	// Check which tabs to show.
	let activeTabs = []
	const currSettings = active ? settings : previousSettings // On an inactive keyboard, use the previous settings. This allows us to show the previous tabs while the keyboard is sliding down into hiding.
	if (currSettings) {
		if (typeof currSettings !== 'object')
			throw new Error(`Invalid keyboard settings: the given settings parameter must be an object, but received something of type ${typeof currSettings}.`)
		activeTabs = tabs.filter(tab => currSettings[tab])
		if (activeTabs.length === 0)
			throw new Error(`Invalid keyboard settings: the given settings parameter must be an object with a key equal to one of the keyboard variants, but no keyboard variants were found.`)
	}

	// Check which tab and keyboard is currently active.
	if (!chosenTab || !activeTabs.includes(chosenTab))
		chosenTab = activeTabs[0]
	const Layout = chosenTab ? keyboards[chosenTab].Layout : null

	// Set up an activation handler.
	const activate = (tab) => {
		setChosenTab(tab)
		setAndStoreOpen(true)
	}

	// Position the keyboard properly.
	const positionKeyboardCB = useCallback(() => { setTimeout(() => positionKeyboard(barRef, tabsRef, keyboardRef, fillerRef, active, open)) }, [barRef, tabsRef, keyboardRef, fillerRef, active, open]) // Use a time-out to ensure this happens after all resizing, rendering and media queries are finished.
	useEffect(positionKeyboardCB, [positionKeyboardCB, chosenTab]) // Also update the position when the active tab changes.
	useEventListener('resize', positionKeyboardCB)

	// Determine the settings for the given keyboard layout.
	let layoutSettings = settings && chosenTab ? settings[chosenTab] : null
	layoutSettings = useCurrentOrPrevious(layoutSettings) // When the settings turn to null, use the previous one for display purposes.

	return <>
		<Paper ref={barRef} elevation={12} square={true} className={clsx(classes.keyboardBar, 'keyboardBar')}>
			<Container maxWidth={theme.appWidth}>
				<div className='tabContainer'>
					<div ref={tabsRef} className='tabs'>
						{activeTabs.length === 1 ? null : activeTabs.map(tab => (
							<Tab
								key={tab}
								active={open && tab === chosenTab}
								onClick={() => activate(tab)}
							>
								{keyboards[tab].tab}
							</Tab>
						))}
						<Tab onClick={() => setAndStoreOpen(!open)}>
							<KeyboardIcon />
							<Arrow className='keyboardArrow' />
						</Tab>
					</div>
				</div>
				<div ref={keyboardRef} className='keyboard'>
					{Layout ?
						<Layout settings={layoutSettings} keyFunction={keyFunction} keySettings={settings && settings.keySettings} />
						: null}
				</div>
			</Container>
		</Paper>
		<div ref={fillerRef} className={clsx(classes.filler, 'filler')} />
	</>
}
export default forwardRef(Keyboard)

let positionKeyboardTimeout
function positionKeyboard(barRef, tabsRef, keyboardRef, fillerRef, active, open) {
	// If they keyboard has been unmounted, do nothing.
	if (!tabsRef.current || !keyboardRef.current)
		return

	// Get keyboard heights.
	const tabHeight = tabsRef.current.offsetHeight
	const keyboardHeight = keyboardRef.current.offsetHeight

	// Check if the keyboard finished rendering. If not (and the height is still small) we should wait for a bit.
	const threshold = 40
	clearTimeout(positionKeyboardTimeout) // Prevent an older setting from applying.
	if (keyboardHeight < threshold) {
		const waitTime = 10 // Milliseconds
		positionKeyboardTimeout = setTimeout(() => positionKeyboard(barRef, tabsRef, keyboardRef, fillerRef, active, open), waitTime)
		return
	}

	// Position the keyboard appropriately.
	if (active) {
		barRef.current.style.bottom = 0
		if (open) {
			barRef.current.style.height = `${keyboardHeight}px`
			fillerRef.current.style.height = `${keyboardHeight + tabHeight}px`
		} else {
			barRef.current.style.height = 0
			fillerRef.current.style.height = `${tabHeight}px`
		}
	} else {
		barRef.current.style.bottom = `${-tabHeight}px`
		barRef.current.style.height = 0
		fillerRef.current.style.height = 0
	}
}