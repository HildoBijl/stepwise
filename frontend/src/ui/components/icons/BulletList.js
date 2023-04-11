import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Icon(props) {
	const yValues = [5, 12, 19]
	return (
		<SvgIcon {...props}>
			{yValues.map((y, index) => <circle key={index} cx="4" cy={y} r="2.5" fill="currentColor" />)}
			{yValues.map((y, index) => <line key={index} x1="10" x2="23" y1={y} y2={y} strokeWidth="2" stroke="currentColor" />)}
		</SvgIcon>
	)
}