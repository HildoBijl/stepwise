import React from 'react'
import { Box, useTheme, alpha } from '@mui/material'
import clsx from 'clsx'

import { notSelectable, centered } from 'ui/theme'

const designSize = 40
export default function ProgressIndicator({ done, total, className, size = designSize, sx }) {
	// Calculate important properties.
	const r = 45
	const part = total === 0 ? 0 : done / total
	const dash1 = part * 2 * Math.PI * r
	const dash2 = (1 - part) * 2 * Math.PI * r

	// Set up the component.
	const theme = useTheme()
	const circleStyle = { fill: 'transparent', strokeWidth: 10, transform: 'rotate(-90deg)' }
	return <Box className={clsx(className, 'progressIndicator')} sx={{ height: `${size}px`, width: `${size}px`, position: 'relative', ...notSelectable, ...sx }}>
		<svg viewBox="-50 -50 100 100" style={{ height: '100%', width: '100%', ...centered }}>
			<circle cx="0" cy="0" r={r} style={{ ...circleStyle, stroke: alpha(theme.palette.text.primary, 0.1) }} />
			<circle cx="0" cy="0" r={r} style={{ ...circleStyle, stroke: theme.palette.primary.main, strokeDasharray: `${dash1} ${dash2}` }} />
		</svg>
		<Box sx={{ fontSize: `${0.6 * size / designSize}rem`, ...centered }}>{done}/{total}</Box>
	</Box>
}
