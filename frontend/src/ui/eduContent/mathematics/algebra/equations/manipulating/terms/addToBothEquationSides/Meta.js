import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>add/subtract a term to/from both sides of an equation</Term>. If you start with an equation like <M>x^2 + 4 = 5</M> then you will be able to add any term, like for instance <M>5x</M>, to both sides of this equation, resulting in <M>x^2 + 4 + 5x = 5 + 5x</M>. This also includes subtracting terms. This skill does not include the subsequent simplification of the resulting outcome.</Par>
	</Translation>
}
