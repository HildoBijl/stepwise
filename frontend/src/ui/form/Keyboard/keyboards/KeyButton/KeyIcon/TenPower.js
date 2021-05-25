import React from 'react'
import SvgIcon from '@material-ui/core/SvgIcon'

export default function Character({ char = '' }) {
	return (
		<SvgIcon>
			<text textAnchor="middle" x="12" y="17" fontSize="14" fontFamily="KaTeX_Main, Times New Roman, serif">10</text>
			<text textAnchor="middle" x="22" y="10" fontSize="9" fontFamily="KaTeX_Main, Times New Roman, serif" fontStyle="italic">x</text>
			<circle cx="1" cy="13" r="1" />
		</SvgIcon>
	)
}