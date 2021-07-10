import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Dot(props) {
	return (
		<SvgIcon {...props}>
			<circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
			<rect width="10" x="7" height="13" y="9" fill="currentColor" stroke="none" style={{opacity: 0.3}} />
		</SvgIcon>
	)
}