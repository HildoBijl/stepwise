import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction of fractions</Term>. If you have a fraction of fractions like <M>\frac(3/4)(9/8)</M> then you will be able to <SkillLink skillId="multiplyDivideFractions">turn this into a single fraction</SkillLink> like <M>\frac(3 \cdot 8)(4 \cdot 9)</M> and subsequently <SkillLink skillId="simplifyFraction">simplify this fraction</SkillLink> into <M>\frac(2)(3)</M>. The result is always a fraction that cannot be simplified further.</Par>
	</Translation>
}
