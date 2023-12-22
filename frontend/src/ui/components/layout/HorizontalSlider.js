import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'

import { boundTo } from 'step-wise/util'

import { getCoordinatesOf, getEventPosition, useEventListener, useForceUpdate, useDimension, useResizeListener } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { notSelectable } from 'ui/theme'

const bottomDisplacement = '0.5rem'
const useStyles = makeStyles((theme) => ({
	slider: {
		borderRadius: '0.25rem',
		marginBottom: ({ sliderInside }) => sliderInside ? 0 : `-${bottomDisplacement}`,
		paddingBottom: ({ sliderInside }) => sliderInside ? 0 : bottomDisplacement,
		overflow: 'hidden',
		position: 'relative',
		transition: `background ${theme.transitions.duration.standard}ms`,
		'&.sliding': {
			...notSelectable,
		},

		'& > .inner': {
			padding: '1px',
			transform: ({ active, padding, slidePart, contentsWidth, containerWidth }) => active ? `translateX(${padding - slidePart * (contentsWidth - containerWidth)}px)` : 'none',
		},

		'&.active': {
			'&:hover, &.sliding, &.dragging': {
				background: alpha(theme.palette.primary.main, 0.05),
				'& > .scroller': {
					opacity: 1, // Show on hover or when sliding.
				},
			},
			'& > .scroller': {
				display: 'block', // Don't show on inactive sliders.
			},
		},
		'& > .scroller': {
			background: alpha(theme.palette.primary.main, 0.2),
			borderRadius: '0.25rem',
			bottom: 0,
			cursor: 'pointer',
			display: 'none',
			height: '0.5rem',
			opacity: 0,
			position: 'absolute',
			transition: `opacity ${theme.transitions.duration.standard}ms`,
			width: '100%',

			'& > .toggle': {
				background: alpha(theme.palette.primary.main, 0.8),
				borderRadius: '0.25rem',
				height: '0.5rem',
				left: ({ active, slidePart, contentsPart }) => active ? `${slidePart * (1 - contentsPart) * 100}%` : '0',
				position: 'absolute',
				width: ({ active, contentsPart }) => active ? `${contentsPart * 100}%` : '100%',
			},
		},
	},
}))

export default function HorizontalSlider({ children, sliderInside = false, padding = 0 }) {
	// Set up required states.
	const [slidePart, setSlidePart] = useState(0) // Keeps track of the slide position. 0 means the slider is all the way on the left and 1 means the slider is all the way on the right.
	const [togglePart, setTogglePart] = useState(undefined) // Keeps track, during sliding of the toggle, where on the toggle was clicked. undefined means no sliding is going on, 0 means the user clicked on exactly the left end of the toggle and 1 means the user clicked on exactly the right end of the toggle.
	const [lastTouch, setLastTouch] = useState(undefined) // Keeps track, during dragging of the element using touch, where the last registered touch on the page was. undefined means no dragging is going on; otherwise it's the x-coordinate of the last touch.
	const sliding = (togglePart !== undefined)
	const dragging = (lastTouch !== undefined)

	// Set up refs for objects.
	const innerRef = useRef()
	const outerRef = useRef()
	const scrollerRef = useRef()

	// Determine width and use it to determine whether we are active.
	let contentsWidth = useDimension(innerRef, 'scrollWidth', useResizeListener)
	const containerWidth = useDimension(innerRef, 'offsetWidth', useResizeListener)
	const active = contentsWidth > containerWidth
	contentsWidth = contentsWidth + (active ? 2 * padding : 0)
	const contentsPart = containerWidth / contentsWidth

	// Set up generic support functions.
	const getClickPosition = (evt) => getEventPosition(evt).x
	const getClickPart = (evt) => {
		const clickPosition = getClickPosition(evt)
		const containerPosition = getCoordinatesOf(outerRef.current).x
		return (clickPosition - containerPosition) / containerWidth
	}

	// Set up sliding handlers.
	const applySliding = (clickPart, togglePart) => {
		setSlidePart(boundTo((clickPart - togglePart * contentsPart) / (1 - contentsPart), 0, 1)) // Determine the slide part based on the position of the mouse and the togglePart.
	}
	const startSliding = (evt) => {
		if (!active)
			return

		// Determine the toggle part. For this, check if the click was on the toggle or next to it.
		const clickPart = getClickPart(evt)
		const minToggle = slidePart * (1 - contentsPart)
		const maxToggle = 1 - (1 - slidePart) * (1 - contentsPart)
		let togglePart
		if (clickPart >= minToggle && clickPart <= maxToggle) // The click was on the toggle. Calculate on which part of the toggle was clicked.
			togglePart = (clickPart - minToggle) / (maxToggle - minToggle)
		else // The click was next to the toggle. Put the toggle such that the cursor it at the middle, unless this doesn't fit.			
			togglePart = boundTo(0.5, 1 - (1 - clickPart) / contentsPart, clickPart / contentsPart)

		// Start the sliding.
		setTogglePart(togglePart)
		applySliding(clickPart, togglePart)
	}
	const updateSliding = (evt) => {
		if (!active || togglePart === undefined)
			return
		applySliding(getClickPart(evt), togglePart)
	}
	const endSliding = () => setTogglePart(undefined)

	// Set up dragging handlers.
	const startDragging = (evt) => active && setLastTouch(getClickPosition(evt))
	const updateDragging = (evt) => {
		if (!active || lastTouch === undefined)
			return
		const touch = getClickPosition(evt)
		setSlidePart(boundTo(slidePart + (touch - lastTouch) / (containerWidth - contentsWidth), 0, 1))
		setLastTouch(touch)
	}
	const endDragging = () => setLastTouch(undefined)

	// Set up event listeners for mouse clicks/drags for the horizontal scroll bar.
	useEventListener('mousedown', startSliding, scrollerRef)
	useEventListener('mousemove', updateSliding)
	useEventListener('mouseup', endSliding)

	// Set up event listeners for touch for the contents itself.
	useEventListener('touchstart', startDragging, outerRef, { passive: true })
	useEventListener('touchmove', updateDragging, undefined, { passive: true })
	useEventListener('touchend', endDragging, undefined, { passive: true })

	// On a window-resize rerender the scrollbar.
	const forceUpdate = useForceUpdate()
	useResizeListener(forceUpdate)
	useEffect(() => forceUpdate(), [forceUpdate])

	// Implement style and render slider.
	const classes = useStyles({ active, sliding, dragging, sliderInside, padding, slidePart, contentsWidth, containerWidth, contentsPart })
	return <div className={clsx(classes.slider, 'slider', { active, inactive: !active, dragging, sliding, waiting: !sliding && !dragging })} ref={outerRef}>
		<div className="inner" ref={innerRef}>
			{children}
		</div>
		<div className="scroller" ref={scrollerRef}>
			<div className="toggle" />
		</div>
	</div>
}
