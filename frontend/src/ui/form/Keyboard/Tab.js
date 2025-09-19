import React from 'react'
import { Box } from '@mui/material'

import { notSelectable } from 'ui/theme'

export function Tab({ children, active, onClick }) {
	return (
		<Box onClick={onClick} sx={theme => ({ // Outer container.
			...notSelectable,
			alignItems: 'center',
			background: ({ active }) => active ? theme.palette.primary.main : theme.palette.primary.light,
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			height: '100%',
			justifyContent: 'center',
			margin: '0 0.65rem', // For in-between tabs.
			padding: '0 0.5rem',
			position: 'relative',
			zIndex: ({ active }) => active ? 2 : 1,
			'&:hover': {
				background: theme.palette.primary.main,
				zIndex: 2,
			},
		})}>
			<Box className='leftEdge' sx={{ // Left edge.
				background: 'inherit',
				borderRadius: '0.6rem 0 0 0',
				height: '100%',
				position: 'absolute',
				left: '-0.6rem',
				top: 0,
				transform: 'skewX(-8deg)',
				width: '1rem',
				zIndex: -1,
			}} />
			<Box className='rightEdge' sx={{ // Right edge.
				background: 'inherit',
				borderRadius: '0 0.6rem 0 0',
				height: '100%',
				position: 'absolute',
				right: '-0.6rem',
				top: 0,
				transform: 'skewX(8deg)',
				width: '1rem',
				zIndex: -1,
			}} />
			{children}
		</Box>
	)
}
