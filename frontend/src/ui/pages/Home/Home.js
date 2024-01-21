import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import { websiteName, websiteNameAddendum } from 'settings'
import { useTextTranslator } from 'i18n'

import { PageTranslationFile } from '../PageTranslationFile'

import { LanguageBar, TitleBar, Description, Blocks } from './parts'

const useStyles = makeStyles((theme) => ({
	topBar: {
		background: theme.palette.primary.main,
		borderRadius: '0% 0% 200% 200%/0% 0% 30% 30%',
	},
}))

export function Home() {
	const classes = useStyles()

	// Load language-dependent texts.
	const translate = useTextTranslator('main')
	const websiteNameTranslation = translate(websiteName, 'websiteName')
	const websiteNameAddendumTranslation = translate(websiteNameAddendum, 'websiteNameAddendum')

	// Render the page.
	return <PageTranslationFile page="home">
		<Helmet><title>{websiteNameTranslation} | {websiteNameAddendumTranslation}</title></Helmet>
		<div className={classes.topBar}>
			<LanguageBar />
			<TitleBar />
		</div>
		<Description />
		<Blocks />
	</PageTranslationFile>
}
