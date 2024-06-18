import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>merge similar terms</Term> inside a summation. For instance when seeing <M>2x^2 + 3x + 4x^2</M> you should immediately realize that <M>2x^2</M> and <M>4x^2</M> are identical, except for the constant factor in front. So these terms can be pulled together into <M>6x^2</M>, resulting in a full expression <M>6x^2 + 3x</M>. This skill also includes dealing with negative factors like in <M>2x^2 - 5x^2</M>.</Par>
	</Translation>
}
