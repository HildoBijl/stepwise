import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a system of linear equations</Term>. If you have two equations with two unknowns like <M>4x + 3y = 6</M> and <M>2x - 4y = 14</M> then you will be able to determine the solution for <M>x</M> and <M>y</M> as <M>x = 3</M> and <M>y = -2</M>. This includes <SkillLink skillId="solveMultiVariableLinearEquation">solving one equation (with multiple variables)</SkillLink> for one unknown, <SkillLink skillId="substituteAnExpression">substituting this solution</SkillLink> into the other equation, <SkillLink skillId="solveLinearEquation">solving that equation (with only one variable)</SkillLink> and finally <SkillLink skillId="substituteANumber">substituting this number</SkillLink> back into the first solution to find the full result.</Par>
	</Translation>
}
