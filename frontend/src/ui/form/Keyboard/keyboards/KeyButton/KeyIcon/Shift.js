import React from 'react'
import { SvgIcon } from '@mui/material'

import { removeProperties } from 'step-wise/util'

export default function Shift(props) {
	const full = props.full
	return (
		<SvgIcon {...removeProperties(props, 'full')}>
			<path d="M12 23h-4c-1 0,-1 0,-1 -1v-10h-5c-1 0,-1 0,0 -1l9 -9c1 -1,1 -1,2 0l9 9c1 1,1 1,0 1h-5v10c0 1,0 1,-1 1h-4z" strokeWidth="2" stroke="currentColor" fill={full ? "currentColor" : "none"} />{/* Start at the middle bottom, use curves at the outer angles. */}
		</SvgIcon>
	)
}