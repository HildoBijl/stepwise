import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>multiply/divide both sides of an equation by a factor</Term>. If you start with an equation like <M>x+2 = 6</M> then you will be able to multiply this by a number like <M>3</M> to get <M>\left(x+2\right) \cdot 3 = 6 \cdot 3</M>. This also includes multiplying by a variable factor (like <M>x</M>), or dividing by a number/factor to for instance get <M>\frac(x+2)(x) = \frac(6)(x)</M>. This skill does not include simplifying the resulting outcome, like <SkillLink skillId="expandBrackets">expanding brackets</SkillLink> or <SkillLink skillId="cancelFractionFactors">canceling fraction factors</SkillLink>.</Par>
	</Translation>
}
