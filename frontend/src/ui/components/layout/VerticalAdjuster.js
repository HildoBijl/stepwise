/* The VerticalAdjuster slowly eases the height of a component when its contents change. Properties that can be applied are:
 * on [default true]: should the component be open (regular height) or closed (0 height).
 * initiallyOn [default true]: only used on initial render and only when on is true. Should the component start closed and open up on render (use false) or already be open without any effect(use true).
 * time [default theme.transitions.duration.standard]: the number of milliseconds which the transition takes.
*/

import React, { useLayoutEffect, useRef, useState } from 'react'
import useResizeObserver from '@react-hook/resize-observer'
import { useTheme, Box } from '@mui/material'

import { useVisible } from '../contexts/visible'

export default function VerticalAdjuster({ children, on = true, initiallyOn = true, time }) {
	const [height, setHeight] = useState(initiallyOn ? undefined : 0)
	const [settling, setSettling] = useState(initiallyOn)
	const ref = useRef()
	const settlingFrames = useRef([])
	const visible = useVisible()
	const wasVisible = useRef(visible)
	const theme = useTheme()
	const cancelSettlingEnd = () => {
		settlingFrames.current.forEach(cancelAnimationFrame)
		settlingFrames.current = []
	}
	const scheduleSettlingEnd = () => {
		cancelSettlingEnd()
		settlingFrames.current.push(requestAnimationFrame(() => {
			settlingFrames.current.push(requestAnimationFrame(() => {
				settlingFrames.current = []
				setSettling(false)
			}))
		}))
	}

	useLayoutEffect(() => {
		if (visible && !wasVisible.current) {
			setHeight(undefined)
			setSettling(true)
		}
		wasVisible.current = visible
		return cancelSettlingEnd
	}, [visible])

	useResizeObserver(ref, entry => {
		if (visible) {
			setHeight(entry.contentRect.height)
			if (settling)
				scheduleSettlingEnd()
		}
	})

	return <Box sx={{
		height: height === undefined || time === 0 ? 'auto' : `${on ? height : 0}px`,
		overflow: 'hidden',
		transition: settling ? 'none' : `height ${time ?? theme.transitions.duration.standard}ms`,
	}}>
		<Box className="verticalAdjusterInner" ref={ref} sx={{ padding: '0.05px 0' }}>
			{children}
		</Box>
	</Box>
}
