import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a quadratic equation</Term> even when it is written in a different form. If you have an equation like <M>2 + \frac(3)(x-5)=\frac(7)(x-9)</M> then you will be able to reduce this to <M>x^2 - 16x + 49 = 0</M> and subsequently solve this as <M>x = 8 \pm \sqrt(15)</M>. This includes <SkillLink skillId="bringEquationToStandardForm">bringing the equation to the standard form</SkillLink> and subsequently <SkillLink skillId="solveQuadraticEquation">solving the quadratic equation</SkillLink>, simplifying the result as much as possible. This skill does not include solving equations that do not reduce to a quadratic equation.</Par>
	</Translation>
}
