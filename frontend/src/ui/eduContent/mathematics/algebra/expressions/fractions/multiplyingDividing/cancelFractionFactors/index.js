import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>cancel fraction factors</Term> for fractions containing variables. For instance, if you have a fraction <M>\frac(2x)(3x)</M> you should see that multiplying by a number <M>x</M> and then dividing by that same number has no effect, so we might as well write <M>\frac(2)(3)</M>. This also includes more complex factors, like turning <M>\frac(2\left(x+3\right))(x\left(x+3\right))</M> into <M>\frac(2)(x)</M> and similar.</Par>
	</Translation>
}
