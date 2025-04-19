import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction of fraction sums with multiple variables</Term>, like turning <M>\left(\frac(x)(4) - \frac(y)(6)\right)/\left(5z\right)</M> into the single fraction <M>\frac(3y - 2x)(60xyz)</M>. This includes <SkillLink skillId="addFractionsWithMultipleVariables">adding/subtracting fractions</SkillLink> and subsequently <SkillLink skillId="simplifyFractionOfFractionsWithVariables">simplifying the fraction of fractions</SkillLink>. The skill does not require <SkillLink skillId="expandBrackets">expanding brackets</SkillLink> or other similar/derived operations.</Par>
	</Translation>
}
