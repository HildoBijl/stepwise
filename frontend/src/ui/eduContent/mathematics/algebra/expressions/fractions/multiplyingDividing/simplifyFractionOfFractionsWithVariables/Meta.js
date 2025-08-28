import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction containing further fractions with variables</Term>. Think of turning <M>\frac(6\left(x+2\right)^2)(10\left(x+2\right)^5/x^4)</M> into <M>\frac(3x^4)(5\left(x+2\right)^3)</M>. This includes turning any potentially <SkillLink skillId="rerwiteNegativePower">negative powers</SkillLink> like <M>x^(-4)</M> into a fraction, turning any <SkillLink skillId="multiplyDivideFractions">fraction of fractions into a single fraction</SkillLink>, and subsequently <SkillLink skillId="simplifyFractionWithVariables">simplifying the resulting fraction</SkillLink>. The skill does not include the <SkillLink skillId="addFractionsWithVariables">addition/subtraction of fractions</SkillLink>.</Par>
	</Translation>
}
