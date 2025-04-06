import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>substitute</Term> a variable in an expression by another expression. For instance, given the expression <M>2x + y</M> you can insert <M>x = y+2</M> to wind up with the expression <M>2\left(y+2\right) + y</M>. No further simplifications are required yet. Since this skill only concerns the substitution, no skills related to fractions, powers, etcetera are required.</Par>
	</Translation>
}
