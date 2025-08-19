import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn what a <Term>negative power</Term> means and how to rewrite it to a form without a negative power. It should become intuitive to rewrite <M>2^(-3)</M> as <M>\frac(1)(2^3)</M> and vice versa.</Par>
	</Translation>
}
