import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>move a factor to the other side of an equation</Term>. If you have an equation like <M>2 = \frac(3)(x)</M> you will be able to bring <M>x</M> to the other side to get <M>2x = 3</M>, or to then bring <M>2</M> to the other side to get <M>x = \frac(3)(2)</M>. This includes understanding the idea behind this: <SkillLink skillId="multiplyBothEquationSides">multiplying both sides of an equation by a factor</SkillLink> and subsequently <SkillLink skillId="cancelFractionFactors">canceling fraction factors</SkillLink>. The skill does not include dealing with <SkillLink skillId="multiplyAllEquationTerms">equations with multiple terms</SkillLink>.</Par>
	</Translation>
}
