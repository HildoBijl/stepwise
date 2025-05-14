import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a linear equation with multiple variables and with fractions</Term>. If you have an equation like <M>\frac(a)(b+1/x) = \frac(c)(3)</M> then you will be able to determine the solution for <M>x</M> as <M>x = \frac(c)(3a-bc)</M>. This includes <SkillLink skillId="simplifyFractionOfFractionSumsWithMultipleVariables">simplifying the fraction with a fraction sum into a single fraction</SkillLink>, <SkillLink skillId="multiplyAllEquationTerms">multiplying equation terms by denominators</SkillLink> and eventually <SkillLink skillId="solveMultiVariableLinearEquation">solving the resulting linear equation</SkillLink>.</Par>
	</Translation>
}
