import React from 'react'
import { Alert, AlertTitle } from '@material-ui/lab'

import { infoEmail } from 'settings'
import { Translation } from 'i18n'
import { Par, List, Link } from 'ui/components'

export function ErrorNote({ text }) {
	return <Translation entry="errorNote" path="main">
		<Alert severity="error">
			<AlertTitle>Oops ... something went wrong.</AlertTitle>
			<Par>The page could not be loaded/displayed properly. {{ reason: text || '' }} We recommend you try the following.</Par>
			<List items={[
				<>Refresh the page (F5). Maybe your connection briefly flaked.</>,
				<>Make sure the URL is correct. No typos?</>,
				<>Try a hard refresh (Shift+F5) to ensure you don't have an old version of the web-app still cached on your device.</>,
				<>The above attempts all fail? It's probably us. Try again later.</>
			]} />
			<Par>Is the bug still present later on? Then please send an email to <Link to={infoEmail}>{{ infoEmail }}</Link> (Hildo). I'll fix the bug, so that both you and others won't continue running into it. If possible, also add:</Par>
			<List items={[
				<>Where the bug occurred: for instance which skill/exercise.</>,
				<>What you did right before the bug appeared.</>,
				<>Possibly a screenshot of any red error message in the Developer's Tools console (F12).</>,
			]} />
		</Alert >
	</Translation>
}
