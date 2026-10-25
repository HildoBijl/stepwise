import React from 'react'
import { Box, alpha } from '@mui/material'

import { useSetLanguage } from 'api'
import { useLanguage } from 'i18n'

export function Language({ children, Flag, language }) {
	const currentLanguage = useLanguage()
	const [setUserLanguage] = useSetLanguage()
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
		<Box>{children}</Box>
	</Box>
}
