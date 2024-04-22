import React from 'react'

import { Translation } from 'i18n'
import { Par, Term } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>The <Term>Meta-Info page</Term> contains background information about the skill, like the exact <Term>learning goal</Term>. This is generally not so useful to students, but more so for teachers. It helps to properly assemble a course.</Par>
		<Par>This current skill has as learning goal that students can <Term>enter integer numbers</Term> into an integer input field. Numbers can be positive or negative and have multiple digits.</Par>
		<Par>Below you also find information about <Term>links to other skills</Term>. What comes before (prerequisites)? What can come after (follow-ups)? And which skills are related to it, for instance by being similar or by being in the same category/grouping?</Par>
	</Translation>
}
