import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a product equation with multiple variables</Term>. This is similar to <SkillLink skillId="solveProductEquation">solving a product equation with a single variable</SkillLink>. Given an equation with only multiplications and divisions, like <M>2a = \frac(3b)(ax)</M> or <M>2ax = \frac(3b)(a)</M>, you will be able to find the solution, like <M>x = \frac(3b)(2a^2)</M>. This includes <SkillLink skillId="moveEquationFactor">moving equation factors around in the equation</SkillLink> until the unknown variable has been isolated, as well as <SkillLink skillId="simplifyFractionWithVariables">simplifying the result</SkillLink> (often a fraction) as much as possible, and subsequently <SkillLink skillId="checkMultiVariableEquationSolution">checking it</SkillLink>. The equations do not include summations, but may contain powers.</Par>
	</Translation>
}
