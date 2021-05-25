import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Arrow(props) {
	return (
		<SvgIcon {...props}>
			<path d="M9 18 l6 -6 -6 -6 v12z" fill="currentColor" />
		</SvgIcon>
	)
}