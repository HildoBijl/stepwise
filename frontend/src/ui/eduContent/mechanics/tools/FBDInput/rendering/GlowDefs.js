import React from 'react'
import { useTheme } from '@mui/material'

import { SvgDefsPortal } from 'ui/figures'

// GlowDefs are the SVG definitions that allow components to glow.
export function GlowDefs() {
	const theme = useTheme()
	return <SvgDefsPortal>
		{[0, 0.6, 1, 1.6].map((value, index) => <filter key={index} id={`selectionFilter${index}`}>
			<feGaussianBlur stdDeviation="3" in="SourceGraphic" result="Blur" />
			<feComposite operator="out" in="Blur" in2="SourceGraphic" result="OuterBlur" />
			<feComponentTransfer in="OuterBlur" result="OuterBlurFaded">
				<feFuncA type="linear" slope={value} />
			</feComponentTransfer>
			<feFlood width="100%" height="100%" floodColor={theme.palette.primary.main} result="Color" />
			<feComposite operator="in" in="Color" in2="OuterBlurFaded" result="Glow" />
			<feMerge>
				<feMergeNode in="Glow" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>)}
	</SvgDefsPortal>
}
