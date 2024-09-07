import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a product equation</Term>. Given an equation with only multiplications and divisions, like <M>2x = \frac(3)(2)</M> or <M>4 = \frac(3)(x)</M>, you will be able to find the solution, like <M>x = \frac(3)(4)</M>. This includes <SkillLink skillId="moveEquationFactor">moving equation factors around in the equation</SkillLink> until the unknown variable has been isolated, as well as <SkillLink skillId="simplifyFraction">simplifying the result</SkillLink> (often a fraction) as much as possible. The equations do not include summations, powers, multiple variables, or anything similar.</Par>
	</Translation>
}
