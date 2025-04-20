import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction of fraction sums with multiple variables</Term>, like turning <M>\left(\frac(x)(2) + \frac(y)(3)\right) / \left(\frac(5)(4z)\right)</M> into the single fraction <M>\frac(2z\left(3x + 2y\right))(15)</M>. This includes <SkillLink skillId="addFractionsWithMultipleVariables">adding/subtracting fractions</SkillLink> and subsequently <SkillLink skillId="simplifyFractionOfFractionsWithVariables">simplifying the fraction of fractions</SkillLink>. The skill does not require <SkillLink skillId="expandBrackets">expanding brackets</SkillLink> or other similar/derived operations.</Par>
	</Translation>
}
