import React from 'react'
import { SvgIcon } from '@mui/material'

export default function PlusMinus(props) {
	return (
		<SvgIcon {...props}>
			<path d="M12 4l0 12" strokeWidth="2" stroke="currentColor" fill="none" />
			<path d="M6 10l12 0" strokeWidth="2" stroke="currentColor" fill="none" />
			<path d="M6 20l12 0" strokeWidth="2" stroke="currentColor" fill="none" />
		</SvgIcon>
	)
}