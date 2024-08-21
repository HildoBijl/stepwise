import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>add/subtract fractions with variables</Term>, like turning <M>\frac(x+1)(3x) - \frac(2)(x+7)</M> into <M>\frac(x^2+2x+7)(3x\left(x+7\right))</M>. This includes multiplying both sides of a fraction by a factor to get an equal denominator, expanding (often double) brackets, and subsequently adding together the two like fractions. The skill does not require the cancellation of potential polynomial fractions afterwards.</Par>
	</Translation>
}
