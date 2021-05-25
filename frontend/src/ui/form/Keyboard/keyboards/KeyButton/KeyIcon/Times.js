import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Times(props) {
	return (
		<SvgIcon {...props}>
			<path d="M8 8l8 8" strokeWidth="2" stroke="currentColor" fill="none" />
			<path d="M8 16l8 -8" strokeWidth="2" stroke="currentColor" fill="none" />
		</SvgIcon>
	)
}