import React from 'react'
import { Typography } from '@mui/material'

import { startEndMarginFix } from 'ui/theme'

export function SubHead({ children, sx, ...props }) {
	return <Typography variant="h6" sx={{
		fontSize: '1.125rem',
		margin: '1rem 0',
		padding: '0.05px 0',
		...startEndMarginFix('', 0),
		...sx,
	}} {...props}>
		{children}
	</Typography>
}
