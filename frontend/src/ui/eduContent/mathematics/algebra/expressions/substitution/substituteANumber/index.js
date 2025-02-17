import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>substitute</Term> a variable in an expression by a number. For instance, given the expression <M>2x+5</M> you can insert <M>x = 3</M> to wind up with the number <M>2 \cdot 3 + 5</M>. Subsequently you can simplify this to a single number like <M>11</M>. So this skill encompasses the simplification of the resulting expression as well, but only up to the point of using summations and multiplications. No skills related to fractions, powers, etcetera are required.</Par>
	</Translation>
}
