import React from 'react'
import { TranslationCatalog, useTextTranslation } from '@step-wise/i18n'
import { Helmet } from 'react-helmet-async'
import { Box } from '@mui/material'

import { LanguageBar, TitleBar, Description, Blocks } from './parts'

export function Home() {
	return <TranslationCatalog folder={['pages']} name="home">
		<HomeContents />
	</TranslationCatalog>
}

function HomeContents() {
	const websiteName = useTextTranslation({ id: 'websiteName', source: 'Step-Wise' })
	const websiteNameAddendum = useTextTranslation({ id: 'websiteNameAddendum', source: 'Practice exercises on your level' })

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
