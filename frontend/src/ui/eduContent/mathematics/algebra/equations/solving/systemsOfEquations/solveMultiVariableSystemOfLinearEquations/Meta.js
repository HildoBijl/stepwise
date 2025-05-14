import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a system of linear equations with multiple variables</Term>. If you have two equations like <M>ax + 3y = b</M> and <M>cx - ay = 8</M>, and two target variables <M>x</M> and <M>y</M>, then you will be able to determine the solution for <M>x</M> and <M>y</M> as <M>x = \frac(ab+24)(a^2+3c)</M> and <M>y = \frac(bc-8a)(a^2+3c)</M>. This includes <SkillLink skillId="solveMultiVariableLinearEquation">solving one equation</SkillLink> for one unknown, <SkillLink skillId="substituteAnExpression">substituting this solution</SkillLink> into the other equation, <SkillLink skillId="solveMultiVariableLinearEquation">solving that equation</SkillLink>, <SkillLink skillId="substituteAnExpression">substituting this result</SkillLink> back into the first solution and <SkillLink skillId="simplifyFractionOfFractionSumsWithMultipleVariables">reducing the resulting fraction of fractions into a single fraction</SkillLink>.</Par>
	</Translation>
}
