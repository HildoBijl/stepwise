import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a linear equation that has fractions</Term> with the unknown in the denominator. For an equation like <M>\frac(2)(x+3)=\frac(5)(x+7)</M> you will be able to find the solution <M>x=-1/3</M>. This includes <SkillLink skillId="multiplyAllEquationTerms">multiplying all equation terms</SkillLink> by a factor to get <M>x</M> out of any denominator, and subsequently <SkillLink skillId="solveLinearEquation">solving the resulting linear equation</SkillLink> in the default way. Effectively, this allows the solution of any type of linear equation.</Par>
	</Translation>
}
