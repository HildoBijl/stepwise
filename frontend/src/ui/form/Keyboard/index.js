import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Container from '@material-ui/core/Container'
import { Keyboard as KeyboardIcon, KeyboardArrowUp as ArrowUp } from '@material-ui/icons'

import { notSelectable } from 'ui/theme'

const useStyles = makeStyles((theme) => ({
	keyboardBar: {
		bottom: 0,
		height: 0,
		top: 'auto', // To override Material UI style settings.
		transition: `height ${theme.transitions.duration.standard}ms`,

		'& .tabContainer': {
			height: 0,
			position: 'relative',
			width: '100%',

			'& .tabs': {
				display: 'flex',
				flexFlow: 'row nowrap',
				height: '2rem',
				right: 0,
				padding: '0 0.4rem', // For separation from the side of the page.
				position: 'absolute',
				bottom: '-2000rem', // To make sure it's hidden on page load.
				transition: `bottom ${theme.transitions.duration.standard}ms`,

				'& .tab': {
					...notSelectable,
					alignItems: 'center',
					background: theme.palette.primary.main,
					cursor: 'pointer',
					display: 'flex',
					flexFlow: 'row nowrap',
					height: '100%',
					justifyContent: 'center',
					margin: '0 0.65rem', // For in-between tabs.
					padding: '0 0.5rem',
					position: 'relative',

					'&:hover': {
						background: theme.palette.primary.light,
						// ToDo: use this color for active tabs.
					},

					'& .leftEdge': {
						background: 'inherit',
						borderRadius: '0.6rem 0 0 0',
						height: '100%',
						position: 'absolute',
						left: '-0.6rem',
						top: 0,
						transform: 'skewX(-8deg)',
						width: '1rem',
						zIndex: -1,
					},
					'& .rightEdge': {
						background: 'inherit',
						borderRadius: '0 0.6rem 0 0',
						height: '100%',
						position: 'absolute',
						right: '-0.6rem',
						top: 0,
						transform: 'skewX(8deg)',
						width: '1rem',
						zIndex: -1,
					},
				},
			},
		},
		'& .keyboardArrow': {
			transform: ({ open }) => `scaleY(${open ? -1 : 1})`,
			transition: `transform ${theme.transitions.duration.standard}ms`,
		},
		'& .keyboard': {
			padding: '0.5rem',
		},
	},
	filler: {
		transition: `height ${theme.transitions.duration.standard}ms`,
	},
}))

export default function Keyboard({ children }) {
	const [open, setOpen] = useState(false)
	const [active, setActive] = useState(false)

	const theme = useTheme()
	const classes = useStyles({ active, open })
	const barRef = useRef()
	const tabsRef = useRef()
	const keyboardRef = useRef()
	const fillerRef = useRef()

	useEffect(() => {
		const tabHeight = tabsRef.current.offsetHeight
		const keyboardHeight = keyboardRef.current.offsetHeight
		if (active) {
			if (open) {
				tabsRef.current.style.bottom = 0
				barRef.current.style.height = `${keyboardHeight}px`
				fillerRef.current.style.height = `${keyboardHeight + tabHeight}px`
			} else {
				tabsRef.current.style.bottom = 0
				barRef.current.style.height = 0
				fillerRef.current.style.height = `${tabHeight}px`
			}
		} else {
			tabsRef.current.style.bottom = `${-tabHeight}px`
			barRef.current.style.height = 0
			fillerRef.current.style.height = 0
		}
	}, [tabsRef, keyboardRef, active, open])

	useEffect(() => {
		setTimeout(() => setActive(true), 3000)
	}, [])

	return <>
		<AppBar ref={barRef} position="fixed" className={clsx(classes.keyboardBar, 'keyboardBar')}>
			<Container maxWidth={theme.appWidth}>
				<div className='tabContainer'>
					<div ref={tabsRef} className='tabs'>
						<div className='tab'>
							<div className='leftEdge' />
							<div className='rightEdge' />
								Number
						</div>
						<div className='tab'>
							<div className='leftEdge' />
							<div className='rightEdge' />
								Unit
						</div>
						<div className='tab' onClick={() => setOpen(!open)}>
							<div className='leftEdge' />
							<div className='rightEdge' />
							<KeyboardIcon />
							<ArrowUp className='keyboardArrow' />
						</div>
					</div>
				</div>
				<div ref={keyboardRef} className='keyboard'>
					Hi!<br />
					Hi!<br />
					Hi!<br />
					Hi!<br />
					Hi!<br />
				</div>
			</Container>
		</AppBar>
		<div ref={fillerRef} className={clsx(classes.filler, 'filler')} />
	</>
	// return <div className={clsx(classes.keyboard, 'keyboard')}>{children}</div>
}