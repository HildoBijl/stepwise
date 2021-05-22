import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Character({ char = '' }) {
	return (
		<SvgIcon>
			<text textAnchor="middle" x="12" y="19.4" fontSize="21" fontFamily="KaTeX_Main, Times New Roman, serif">{char}</text>
		</SvgIcon>
	)
}