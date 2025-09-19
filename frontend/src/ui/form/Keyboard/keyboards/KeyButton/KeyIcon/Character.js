import React from 'react'
import { SvgIcon } from '@mui/material'

export default function Character({ char = '', scale = 1 }) {
	return (
		<SvgIcon>
			<text textAnchor="middle" x="12" y={14 + scale * 5.4} fontSize={21 * scale} fontFamily="KaTeX_Main, Times New Roman, serif">{char}</text>
		</SvgIcon>
	)
}