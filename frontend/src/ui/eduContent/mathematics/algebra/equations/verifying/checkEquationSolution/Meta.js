import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>check an equation solution</Term>. Given an equation like <M>2\left(x - 4\right) = 5\left(x + 2\right)</M> and a potential solution like <M>x = 3</M> or <M>x = -6</M> you will be able to determine whether or not the number balances the equation. This includes applying number substitution to the expression on each side of the equation, as well as calculating the resulting sum/product, turning it into a single number. Knowledge of fractions, powers, etcetera is not required.</Par>
	</Translation>
}
