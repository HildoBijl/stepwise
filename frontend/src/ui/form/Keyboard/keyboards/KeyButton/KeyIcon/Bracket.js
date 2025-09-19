import React from 'react'
import { SvgIcon } from '@mui/material'

export default function Bracket({ open = true }) {
	return (
		<SvgIcon>
			<text textAnchor="middle" x="12" y="17" fontSize="18" fontFamily="KaTeX_Main, Times New Roman, serif" fontWeight="bold">{open ? '(' : ')'}</text>
		</SvgIcon>
	)
}