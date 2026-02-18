import React from 'react'
import { Helmet } from 'react-helmet'
import { Box } from '@mui/material'

import { websiteName, websiteNameAddendum } from 'settings'
import { useTextTranslator } from 'i18n'

import { PageTranslationFile } from '../PageTranslationFile'

import { LanguageBar, TitleBar, Description, Blocks } from './parts'

export function Home() {
	// Load language-dependent texts.
	const translate = useTextTranslator('main')
	const websiteNameTranslation = translate(websiteName, 'websiteName')
	const websiteNameAddendumTranslation = translate(websiteNameAddendum, 'websiteNameAddendum')

	// Render the page.
	return <PageTranslationFile page="home">
		<Helmet><title>{websiteNameTranslation} | {websiteNameAddendumTranslation}</title></Helmet>
		<Box sx={theme => ({ background: theme.palette.primary.main, borderRadius: '0% 0% 200% 200%/0% 0% 30% 30%' })}>
			<LanguageBar />
			<TitleBar />
		</Box>
		<Description />
		<Blocks />
	</PageTranslationFile>
}
