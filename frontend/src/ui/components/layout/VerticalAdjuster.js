/* The VerticalAdjuster slowly eases the height of a component when its contents change. Properties that can be applied are:
 * on [default true]: should the component be open (regular height) or closed (0 height).
 * initiallyOn [default true]: only used on initial render and only when on is true. Should the component start closed and open up on render (use false) or already be open without any effect(use true).
 * time [default theme.transitions.duration.standard]: the number of milliseconds which the transition takes.
*/

import React, { useState, forwardRef, useRef, useLayoutEffect } from 'react'
import ReactResizeDetector from 'react-resize-detector'
import { useTheme, Box } from '@mui/material'

export default function VerticalAdjuster({ children, on = true, initiallyOn = true, time }) {
	const [height, setHeight] = useState(initiallyOn ? undefined : 0)
	const ref = useRef()
  const theme = useTheme()

	return <Box sx={{
		height: height === undefined || time === 0 ? 'auto' : `${on ? height : 0}px`,
		overflow: 'hidden',
		transition: `height ${time ?? theme.transitions.duration.standard}ms`,
	}}>
		<ReactResizeDetector handleHeight>
			<VerticalAdjusterInner ref={ref} setHeight={setHeight}>
				{children}
			</VerticalAdjusterInner>
		</ReactResizeDetector>
	</Box>
}

const VerticalAdjusterInner = forwardRef(({ children, height, setHeight }, ref) => {
	useLayoutEffect(() => {
		if (height !== undefined)
			setHeight(height)
	}, [height, setHeight])
	return <Box className="verticalAdjusterInner" ref={ref} sx={{ padding: '0.05px 0' }}>{children}</Box> // Adding tiny padding prevents margin-collapse issues inside overflow:hidden.
})
