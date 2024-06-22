import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction</Term> dividing two numbers. For instance, you should see that <M>\frac(2)(6)</M> can more easily be written as <M>\frac(1)(3)</M> or that <M>\frac(42)(28)</M> reduces to <M>\frac(3)(2)</M>. The fraction is reduced to a form that cannot be simplified further.</Par>
	</Translation>
}
