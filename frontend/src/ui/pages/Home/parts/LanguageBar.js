import React from 'react'
import { Box, Container } from '@mui/material'
import { GB, NL, DE } from 'country-flag-icons/react/3x2'

import { useLanguage, useSetLanguage } from 'i18n'
import { notSelectable } from 'ui/theme'

export function LanguageBar() {
	return <Container maxWidth='lg' sx={{ display: 'flex', flexFlow: 'row nowrap', flexDirection: 'row-reverse' }}>
		<LanguageBarFlag Flag={DE} language="de" />
		<LanguageBarFlag Flag={NL} language="nl" />
		<LanguageBarFlag Flag={GB} language="en" />
	</Container>
}

function LanguageBarFlag({ Flag, language }) {
	const currentLanguage = useLanguage()
	const setLanguage = useSetLanguage()
	const active = language === currentLanguage

	return <Box sx={theme => ({
		...notSelectable,
		cursor: active ? 'default' : 'pointer',
		opacity: active ? 1 : 0.5,
		transition: `opacity ${theme.transitions.duration.standard}ms`,

		borderRadius: '0.75rem',
		margin: '0.4rem 0.15rem',
		width: '1.5rem',
		[theme.breakpoints.up('md')]: {
			borderRadius: '1rem',
			margin: '0.5rem 0.2rem',
			width: '2rem',
		},

		'&:hover': {
			opacity: active ? 1 : 0.8,
		},
	})}>
		<Flag style={{ borderRadius: '1rem', display: 'block' }} onClick={() => setLanguage(language)} />
	</Box>
}
