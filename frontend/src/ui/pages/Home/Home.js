import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Box } from '@mui/material'
import { useLingui } from '@lingui/react'

import { TranslationCatalog } from '@step-wise/i18n'

import { PageTranslationFile } from '../PageTranslationFile'

import { homeMessages } from './messages'
import { LanguageBar, TitleBar, Description, Blocks } from './parts'

export function Home() {
	return <PageTranslationFile page="home">
		<TranslationCatalog path="pages/home">
			<HomeContents />
		</TranslationCatalog>
	</PageTranslationFile>
}

function HomeContents() {
	const { _ } = useLingui()
	const websiteName = _(homeMessages.websiteName)
	const websiteNameAddendum = _(homeMessages.websiteNameAddendum)

	return <>
		<Helmet><title>{`${websiteName} | ${websiteNameAddendum}`}</title></Helmet>
		<Box sx={theme => ({ background: theme.palette.primary.main, borderRadius: '0% 0% 200% 200%/0% 0% 30% 30%' })}>
			<LanguageBar />
			<TitleBar />
		</Box>
		<Description />
		<Blocks />
	</>
}
