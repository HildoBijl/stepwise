import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>check the solution of an equation with multiple variables</Term>. Given an equation like <M>2\left(x + 3\right) = 6 + a</M> and a potential solution like <M>x = \frac(a)(2)</M> you will be able to determine whether or not the expression balances the equation. This includes substituting the solution (the full expression) into the equation, simplifying both sides and seeing if they reduce to the same. Simplifications may include <SkillLink skillId="expandBrackets">expanding brackets</SkillLink> and <SkillLink skillId="mergeSimilarTerms">merging terms</SkillLink>. The exercises will not require <SkillLink skillId="expandDoubleBrackets">double brackets</SkillLink> or <SkillLink skillId="simplifyFractionWithVariables">fractions with variables</SkillLink>.</Par>
	</Translation>
}
