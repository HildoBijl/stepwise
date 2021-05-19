import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import clsx from 'clsx'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import { Keyboard as KeyboardIcon } from '@material-ui/icons'

import { usePrevious, useEventListener } from 'util/react'

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

			'& .tabs': {
				bottom: 0, // To make sure it's hidden on page load.
				display: 'flex',
				flexFlow: 'row nowrap',
				height: '2rem',
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
			padding: '0.5rem 0',
		},
	},
	filler: {
		transition: `height ${theme.transitions.duration.standard}ms`,
	},
}))

function Keyboard({ settings, keyFunction }, ref) {
	const [open, setOpen] = useState(true)
	const [chosenTab, setChosenTab] = useState()
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
	let activeTab = chosenTab
	if (!chosenTab || !activeTabs.includes(chosenTab))
		activeTab = activeTabs[0]
	const Buttons = activeTab ? keyboards[activeTab].Buttons : null

	// Set up an activation handler.
	const activate = (tab) => {
		setChosenTab(tab)
		setOpen(true)
	}

	// Position the keyboard properly.
	const positionKeyboardCB = useCallback(() => { setTimeout(() => positionKeyboard(barRef, tabsRef, keyboardRef, fillerRef, active, open)) }, [barRef, tabsRef, keyboardRef, fillerRef, active, open]) // Use a time-out to ensure this happens after all resizing, rendering and media queries are finished.
	useEffect(positionKeyboardCB, [positionKeyboardCB, activeTab]) // Also update the position when the active tab changes.
	useEventListener('resize', positionKeyboardCB)

	return <>
		<Paper ref={barRef} elevation={12} square={true} className={clsx(classes.keyboardBar, 'keyboardBar')}>
			<Container maxWidth={theme.appWidth}>
				<div className='tabContainer'>
					<div ref={tabsRef} className='tabs'>
						{activeTabs.length === 1 ? null : activeTabs.map(tab => (
							<Tab
								key={tab}
								active={open && tab === activeTab}
								onClick={() => activate(tab)}
							>
								{keyboards[tab].tab}
							</Tab>
						))}
						<Tab onClick={() => setOpen(!open)}>
							<KeyboardIcon />
							<Arrow className='keyboardArrow' />
						</Tab>
					</div>
				</div>
				<div ref={keyboardRef} className='keyboard'>
					{Buttons ?
						<Buttons settings={settings && activeTab ? settings[activeTab] : null} keyFunction={keyFunction} />
						: null}
				</div>
			</Container>
		</Paper>
		<div ref={fillerRef} className={clsx(classes.filler, 'filler')} />
	</>
}
export default forwardRef(Keyboard)

function positionKeyboard(barRef, tabsRef, keyboardRef, fillerRef, active, open) {
	const tabHeight = tabsRef.current.offsetHeight
	const keyboardHeight = keyboardRef.current.offsetHeight
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