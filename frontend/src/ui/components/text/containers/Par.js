import React from 'react'
import { Box } from '@mui/material'

import { resolveFunctions } from 'step-wise/util'

import { startEndMarginFix } from 'ui/theme'

export function Par({ children, sx, ...props }) {
	return <Box sx={theme => ({
		margin: '0.8rem 0',
		padding: '0.05px 0.2rem 0 0',
		...startEndMarginFix('', '0.5rem'),
		textAlign: 'left',
		[theme.breakpoints.up('sm')]: {
			textAlign: 'justify',
		},
		...resolveFunctions(sx, theme),
	})}	{...props}>
		{children}
	</Box>
}
