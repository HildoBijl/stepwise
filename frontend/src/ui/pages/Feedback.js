import React from 'react'

import { Translation } from 'i18n'

import { infoEmail } from 'settings'
import { Par, Head } from 'ui/components'

import { PageTranslationFile } from './PageTranslationFile'

export function Feedback() {
	return (
		<PageTranslationFile page="feedback">
			<Translation entry="introduction">
				<Par>Step-Wise is still experimental and is continuously developed further. Feedback is always welcome!</Par>
			</Translation>

			<Translation entry="bugs">
				<Head>Found a bug?</Head>
				<Par>When you encounter a bug (doesn't matter how small) then send an email to <a href={`mailto:${infoEmail}`}>{{infoEmail}}</a> (Hildo). I'll solve it right away for you, so that both you and others won't run into it again. If possible please add:</Par>
				<ul>
					<li>Where you encountered the bug: which skill/exercise.</li>
					<li>What you did right before the bug popped up.</li>
					<li>If possible a screenshot of the red error message from the Developer's Tools console (F12).</li>
				</ul>
			</Translation>

			<Translation entry="improvements">
				<Head>Got ideas for improvement?</Head>
				<Par>Would you like to see a change or extension? Let me know, and if it's not too much work we'll set it up as soon as we can! Email your idea to <a href={`mailto:${infoEmail}`}>{{infoEmail}}</a> and tell us everything you would like to see.</Par>
			</Translation>

			<Translation entry="plans">
				<Head>Existing plans</Head>
				<Par>We are currently working on or planning to work on the following.</Par>
				<ul>
					<li><strong>Translation:</strong> Step-Wise is being extended to English and German!</li>
					<li><strong>Theory pages:</strong> Every skill will get a brief summary with theory about the subject, including the steps to take to solve an exercise.</li>
					<li><strong>Attachments:</strong> In the attachment pages you can look up physical constants. This is especially useful since physical constants aren't as constant across the internet as their name would imply.</li>
					<li><strong>More topics:</strong> Especially on the fields of fundamental mathematics and engineering mechanics (statics) further skills will be added.</li>
				</ul>
				<Par>In which direction Step-Wise will be developed afterwards is something only time will tell. And you, through tips and suggestions!</Par>
			</Translation>
		</PageTranslationFile>
	)
}
