/* The VerticalAdjuster slowly eases the height of a component when its contents change. Properties that can be applied are:
 * on [default true]: should the component be open (regular height) or closed (0 height).
 * initiallyOn [default true]: only used on initial render and only when on is true. Should the component start closed and open up on render (use false) or already be open without any effect(use true).
 * time [default theme.transitions.duration.standard]: the number of milliseconds which the transition takes.
*/

import React, { useState, forwardRef, useRef, useLayoutEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReactResizeDetector from 'react-resize-detector'

const useStyles = makeStyles((theme) => ({
	verticalAdjuster: {
		height: ({ height, time }) => (height === undefined || time === 0) ? 'auto' : `${height}px`,
		overflow: 'hidden',
		transition: ({ time }) => `height ${getTime(time, theme)}ms`,

		'& .verticalAdjusterInner': {
			padding: '0.05px 0', // A fix to compensate for the ridiculous habit of 'overflow hidden' to ignore margin collapse.
		},
	},
}))

export default function VerticalAdjuster({ children, on = true, initiallyOn = true, time }) {
	const [height, setHeight] = useState(initiallyOn ? undefined : 0)
	const ref = useRef()

	const classes = useStyles({
		time,
		height: on ? height : 0,
	})

	return (
		<div className={classes.verticalAdjuster}>
			<ReactResizeDetector handleHeight>
				<VerticalAdjusterInner ref={ref} setHeight={setHeight}>
					{children}
				</VerticalAdjusterInner>
			</ReactResizeDetector>
		</div>
	)
}

const VerticalAdjusterInner = forwardRef(({ children, height, setHeight }, ref) => {
	useLayoutEffect(() => {
		if (height !== undefined)
			setHeight(height)
	}, [height, setHeight])
	return <div className="verticalAdjusterInner" ref={ref}>{children}</div>
})

function getTime(time, theme) {
	return time !== undefined ? time : theme.transitions.duration.standard
}