import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify fractions containing variables</Term>, like turning <M>\frac(2x^4)(6x^2)</M> into <M>\frac(x^2)(3)</M>. This includes simplifying number fractions, rewriting powers and canceling fraction factors. Effectively, it's an application of the rule <M>\frac(x^a)(x^b) = x^(a-b)</M>. The skill does not include the addition/subtraction of fractions.</Par>
	</Translation>
}
