import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction of fraction sums with variables</Term>. Think of starting with <M>\frac(\left(x+2\right)\left(1 + \frac(5)(x)\right))(\frac(1)(x+4) + 3)</M> and eventually reducing it to <M>\frac(x^3+11x^2+38x+40)(3x^2+13x)</M>. This includes adding the various fractions (above and below) together into a single fraction, and then simplifying the resulting fraction of fractions. The skill does not require the cancellation of potential polynomial fractions afterwards.</Par>
	</Translation>
}
