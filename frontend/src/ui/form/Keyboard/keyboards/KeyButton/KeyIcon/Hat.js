import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Hat(props) {
	return (
		<SvgIcon {...props}>
			<path d="M8 6l4 -4l4 4" strokeWidth="1" stroke="currentColor" fill="none" />
			<rect width="10" x="7" height="13" y="9" fill="currentColor" stroke="none" style={{opacity: 0.3}} />
		</SvgIcon>
	)
}