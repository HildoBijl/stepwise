import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>add like fractions with variables</Term>, like turning <M>\frac(4x+3)(5x) - \frac(x-2)(5x)</M> into <M>\frac(3x+5)(5x)</M>. This includes merging two fractions with equal denominator into one fraction, expanding any potential brackets in the numerator, and subsequently simplifying the numerator by merging similar terms. The skill does not include canceling fraction factors or dealing with fractions with different denominators.</Par>
	</Translation>
}
