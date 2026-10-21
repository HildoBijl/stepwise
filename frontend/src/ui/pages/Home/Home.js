import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Box } from '@mui/material'

import { TranslationCatalog, TranslationFolder, useTranslation } from '@step-wise/i18n'

import { PageTranslationFile } from '../PageTranslationFile'

import { LanguageBar, TitleBar, Description, Blocks } from './parts'

export function Home() {
	return <PageTranslationFile page="home">
		<TranslationFolder path="pages">
			<TranslationCatalog name="home">
				<HomeContents />
			</TranslationCatalog>
		</TranslationFolder>
	</PageTranslationFile>
}

function HomeContents() {
	const websiteName = useTranslation({ id: 'websiteName', children: 'Step-Wise' })
	const websiteNameAddendum = useTranslation({ id: 'websiteNameAddendum', children: 'Practice exercises on your level' })

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
