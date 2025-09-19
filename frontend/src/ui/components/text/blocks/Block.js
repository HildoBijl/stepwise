import React from 'react'
import { Alert } from '@mui/material'

import { startEndMarginFix } from 'ui/theme'

export default function Info({ type, children, ...props }) {
	return <Alert
		severity={type}
		sx={(theme) => ({
			margin: '0.8rem 0',
			...startEndMarginFix('', '0.5rem'),
			textAlign: 'left',
			[theme.breakpoints.up('sm')]: {
				textAlign: 'justify',
			},
		})}
		{...props}>
		{children}
	</Alert>
}
