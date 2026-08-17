/* The VerticalAdjuster slowly eases the height of a component when its contents change. Properties that can be applied are:
 * on [default true]: should the component be open (regular height) or closed (0 height).
 * initiallyOn [default true]: only used on initial render and only when on is true. Should the component start closed and open up on render (use false) or already be open without any effect(use true).
 * time [default theme.transitions.duration.standard]: the number of milliseconds which the transition takes.
*/

import React, { useState, useRef } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { useTheme, Box } from '@mui/material'

export default function VerticalAdjuster({ children, on = true, initiallyOn = true, time }) {
	const [height, setHeight] = useState(initiallyOn ? undefined : 0)
	const ref = useRef()
	const theme = useTheme()
	useResizeObserver(ref, entry => setHeight(entry.contentRect.height))

	return <Box sx={{
		height: height === undefined || time === 0 ? 'auto' : `${on ? height : 0}px`,
		overflow: 'hidden',
		transition: `height ${time ?? theme.transitions.duration.standard}ms`,
	}}>
		<Box className="verticalAdjusterInner" ref={ref} sx={{ padding: '0.05px 0' }}>
			{children}
		</Box>
	</Box>
}
