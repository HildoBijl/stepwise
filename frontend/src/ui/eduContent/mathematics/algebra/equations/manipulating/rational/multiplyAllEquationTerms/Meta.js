import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>multiply or divide all terms of an equation</Term> by a factor. If you have an equation like <M>2 + \frac(3)(x) = 5x</M> then you will be able to instantly multiply all terms by <M>x</M> to end up at <M>2x + 3 = 5x^2</M>, or do the reverse. This includes understanding the idea behind this: <SkillLink skillId="multiplyBothEquationSides">multiplying both sides of an equation by a factor</SkillLink> and subsequently <SkillLink skillId="expandBrackets">expanding brackets</SkillLink> and <SkillLink skillId="simplifyFractionWithVariables">simplifying any resulting fractions</SkillLink>. The skill does not deal with which factor might be wise to multiply/divide by.</Par>
	</Translation>
}
