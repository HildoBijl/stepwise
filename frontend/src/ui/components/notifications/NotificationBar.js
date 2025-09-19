import React from 'react'
import { Container, Typography, useTheme, alpha, Box } from '@mui/material'

import { getIcon } from 'ui/theme'

export default function NotificationBar({ display = true, type, children }) {
	const theme = useTheme()

	// If specified that it shouldn't be displayed, show nothing.
	if (!display)
		return null

	// Render the component.
	const Icon = getIcon(type)
	return <Box sx={{
		backgroundColor: theme.palette[type].main,
		boxShadow: theme.shadows[2],
		color: theme.palette[type].contrastText,
		py: 1.5,
	}}>
		<Container maxWidth={theme.appWidth} sx={{
			display: 'flex',
			alignItems: 'center',
			flexFlow: 'row nowrap',
		}}>
			<Box className="icon" sx={{
				flex: '0 0 auto',
				display: 'inline-flex',
				minWidth: theme.spacing(6),
			}}>
				{Icon ? <Icon /> : null}
			</Box>
			<Box className="text" sx={{
				flex: '1 1 auto',
				'& a': {
					color: alpha(theme.palette[type].contrastText, 0.8),
					fontWeight: 600,
					textDecoration: 'none',
					'&:hover': {
						color: theme.palette[type].contrastText,
					},
				},
			}}>
				<Typography>{children}</Typography>
			</Box>
		</Container>
	</Box>
}
