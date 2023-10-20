import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export function Circle(props) {
	return (
		<SvgIcon {...props}>
			<circle cx="12" cy="12" r="4" fill="currentColor" />
		</SvgIcon>
	)
}
