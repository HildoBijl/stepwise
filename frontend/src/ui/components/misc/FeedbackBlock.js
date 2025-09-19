import React from 'react'
import { Box, useTheme, alpha } from '@mui/material'

import { resolveFunctions } from 'step-wise/util'

import { getIcon, getFeedbackColor } from 'ui/theme'

export default function FeedbackBlock({ className, type, text, Icon, color, sx }) {
	// Apply defaults.
	const theme = useTheme()
	if (Icon === undefined)
		Icon = getIcon(type)
	if (color === undefined)
		color = getFeedbackColor(type, theme)

	// Render the component.
	return <Box className={className} sx={theme => ({
		alignItems: 'center',
		background: alpha(color, 0.1),
		borderRadius: '0.5em',
		color: color,
		display: 'flex',
		flexFlow: 'row nowrap',
		margin: '1em 0',
		padding: '0.8em',
		...resolveFunctions(sx, theme)
	})}>
		<Box sx={{ flex: '0 0 auto', display: 'inline-flex', minWidth: theme.spacing(5) }}>{Icon ? <Icon /> : null}</Box>
		<Box sx={{ flex: '1 1 auto' }}>{text}</Box>
	</Box>
}
