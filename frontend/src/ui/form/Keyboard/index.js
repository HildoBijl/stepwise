import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import clsx from 'clsx'

import { useTheme, makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import { Keyboard as KeyboardIcon } from '@material-ui/icons'

import { notSelectable } from 'ui/theme'
import Arrow from 'ui/components/icons/Arrow'

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

				'& .tab': {
					...notSelectable,
					alignItems: 'center',
					background: theme.palette.primary.light,
					cursor: 'pointer',
					display: 'flex',
					flexFlow: 'row nowrap',
					height: '100%',
					justifyContent: 'center',
					margin: '0 0.65rem', // For in-between tabs.
					padding: '0 0.5rem',
					position: 'relative',

					'&:hover': {
						background: theme.palette.primary.main,
						// ToDo: use this color, or the light one, for inactive tabs.
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
			transform: ({ open }) => `translateX(2px) rotate(${open ? 90 : -90}deg)`,
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

function Keyboard({ settings }, ref) {
	const [open, setOpen] = useState(false)
	const active = !!settings

	const theme = useTheme()
	const classes = useStyles({ active, open })
	const barRef = useRef()
	const tabsRef = useRef()
	const keyboardRef = useRef()
	const fillerRef = useRef()

	// Position the keyboard properly.
	useEffect(() => {
		const tabHeight = tabsRef.current.offsetHeight
		const keyboardHeight = keyboardRef.current.offsetHeight
		if (active) {
			// tabsRef.current.style.bottom = 0
			barRef.current.style.bottom = 0
			if (open) {
				barRef.current.style.height = `${keyboardHeight}px`
				fillerRef.current.style.height = `${keyboardHeight + tabHeight}px`
			} else {
				barRef.current.style.height = 0
				fillerRef.current.style.height = `${tabHeight}px`
			}
		} else {
			// tabsRef.current.style.bottom = `${-tabHeight}px`
			barRef.current.style.bottom = `${-tabHeight}px`
			barRef.current.style.height = 0
			fillerRef.current.style.height = 0
		}
	}, [tabsRef, keyboardRef, active, open])

	// Provide API for objects using the keyboard ref.
	useImperativeHandle(ref, () => ({
		contains(obj) {
			return barRef.current.contains(obj)
		},
	}))

	return <>
		<Paper ref={barRef} elevation={12} square={true} className={clsx(classes.keyboardBar, 'keyboardBar')}>
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
							<Arrow className='keyboardArrow' />
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
		</Paper>
		<div ref={fillerRef} className={clsx(classes.filler, 'filler')} />
	</>
}
export default forwardRef(Keyboard)