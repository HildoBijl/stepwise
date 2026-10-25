import React from 'react'
import { Alert, AlertTitle } from '@mui/material'

import { Translation, TranslationCatalog, TranslationFolder, TranslationGroup } from '@step-wise/i18n'

import { infoEmail } from 'settings'
import { Par, List, Link } from 'ui/components'

export function ErrorNote({ text, error }) {
	if (error)
		console.error(error)
	const emailLink = <Link to={infoEmail}>{infoEmail}</Link>
	return <TranslationFolder path={[]} extend={false}>
		<TranslationCatalog name="main">
			<TranslationGroup path="errorNote">
				<Alert severity="error">
					<AlertTitle><Translation id="title">Oops ... something went wrong.</Translation></AlertTitle>
					<Translation id="body">
						<Par>The page could not be loaded/displayed properly. {{ reason: text || '' }} We recommend you try the following.</Par>
						<List>
							<List.Item>Refresh the page (F5). Maybe your connection briefly flaked.</List.Item>
							<List.Item>Make sure the URL is correct. No typos?</List.Item>
							<List.Item>Try a hard refresh (Shift+F5) to ensure you don't have an old version of the web-app still cached on your device.</List.Item>
							<List.Item>The above attempts all fail? It's probably us. Try again later.</List.Item>
						</List>
						<Par>Is the bug still present later on? Then please send an email to {{ emailLink }} (Hildo). I'll fix the bug, so that both you and others won't continue running into it. If possible, also add:</Par>
						<List>
							<List.Item>Where the bug occurred: for instance which skill/exercise.</List.Item>
							<List.Item>What you did right before the bug appeared.</List.Item>
							<List.Item>Possibly a screenshot of any red error message in the Developer's Tools console (F12).</List.Item>
						</List>
					</Translation>
				</Alert>
			</TranslationGroup>
		</TranslationCatalog>
	</TranslationFolder>
}
