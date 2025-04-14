import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a linear equation with multiple variables</Term>. If you have an equation like <M>a\left(x+2\right)=bx+c</M> then you will be able to determine the solution for <M>x</M> as <M>x = \frac(c-2a)(a-b)</M>. This includes <SkillLink skillId="expandBrackets">expanding any potential brackets</SkillLink>, <SkillLink skillId="moveEquationTerm">moving terms around</SkillLink>, <SkillLink skillId="pullFactorOutOfBrackets">pulling the unknown out of brackets</SkillLink> and eventually <SkillLink skillId="solveMultiVariableProductEquation">solving the resulting product equation</SkillLink>. The latter also includes simplifying the result as well as checking it. This skill does not deal with <SkillLink skillId="solveMultiVariableLinearEquationWithFractions">equations with fractions containing <M>x</M> in the denominator</SkillLink>.</Par>
	</Translation>
}
