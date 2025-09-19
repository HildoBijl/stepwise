import React from 'react'
import { SvgIcon } from '@mui/material'

export function Circle(props) {
	return (
		<SvgIcon {...props}>
			<circle cx="12" cy="12" r="4" fill="currentColor" />
		</SvgIcon>
	)
}
