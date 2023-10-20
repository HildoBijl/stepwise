import React from 'react'

import { infoEmail } from 'settings'
import { Translation } from 'i18n'
import { Par, List, Link } from 'ui/components'

export function ErrorNote({ error, info, text }) {
	// ToDo later: log error and info.
	return <Translation entry="errorNote" path="main">
		<Par>Oops ... something went wrong. {{ reason: text || '' }}</Par>
		<Par>It could be that an old version of this app is still present on your device. Try a hard refresh (shift+F5) to see if this solves the problem.</Par>
		<Par>Is the bug still there? If so, please send an email to <Link to={infoEmail}>{{ infoEmail }}</Link> (Hildo). Then I will fix the bug, so that both you and others won't continue running into it. If possible, also add:</Par>
		<List items={[
			'Where the bug occurred: which skill/exercise.',
			'What you did right before the bug appeared.',
			'Possibly a screenshot of the red error message in the Developer\'s Tools console (F12).'
		]} />
	</Translation>
}
// ToDo later: add some kind of image to make this more fun. Maybe a dead leaf?
