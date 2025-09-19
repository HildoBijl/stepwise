import React from 'react'
import { useTheme, alpha } from '@mui/material'

import { Rectangle as SvgRectangle } from 'ui/figures'

import { useDrawingInputData } from '../context'

export function SelectionRectangle() {
	const theme = useTheme()
	const { selectionRectangle } = useDrawingInputData()

	// If no rectangle has been given, we are obviously not selecting. Don't display anything.
	if (!selectionRectangle)
		return null

	// Render the selection rectangle.
	return <SvgRectangle dimensions={selectionRectangle} style={{
		fill: alpha(theme.palette.primary.main, 0.03),
		stroke: theme.palette.primary.main,
		strokeWidth: 0.5,
		strokeDasharray: '4 2',
		opacity: 0.7,
	}} />
}
