import React from 'react'
import { Box, alpha } from '@mui/material'

import { useSetLanguageMutation } from 'api/user'
import { Translation, useLanguage } from 'i18n'

export function Language({ Flag, language, text }) {
	const currentLanguage = useLanguage()
	const [setUserLanguage] = useSetLanguageMutation()
	const active = language === currentLanguage

	return <Box onClick={() => setUserLanguage(language)} sx={theme => ({
		alignItems: 'center',
		background: alpha(theme.palette[active ? 'success' : 'info'].main, 0.2),
		borderRadius: '0.5em',
		cursor: 'pointer',
		display: 'flex',
		flexFlow: 'row nowrap',
		fontSize: '1.2em',
		margin: `0.25em 0`,
		padding: `0.5em 0.75em`,
	})}>
		<Box sx={{ marginRight: '0.75em', height: '1.2em', width: '1.8em' }}><Flag /></Box>
		<Box><Translation entry={language}>{text}</Translation></Box>
	</Box>
}
