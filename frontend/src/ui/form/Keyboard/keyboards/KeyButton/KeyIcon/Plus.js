import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Plus(props) {
	return (
		<SvgIcon {...props}>
			<path d="M12 6l0 12" strokeWidth="2" stroke="currentColor" fill="none" />
			<path d="M6 12l12 0" strokeWidth="2" stroke="currentColor" fill="none" />
		</SvgIcon>
	)
}