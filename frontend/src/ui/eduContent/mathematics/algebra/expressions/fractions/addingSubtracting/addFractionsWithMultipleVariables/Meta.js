import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>add/subtract fractions with multiple variables</Term>, like turning <M>\frac(1)(4a) + \frac(1)(6b)</M> into <M>\frac(3b + 2a)(12ab)</M>. This includes <SkillLink skillId="cancelFractionFactors">multiplying both sides of a fraction by a factor</SkillLink> to get an equal denominator and subsequently <SkillLink skillId="addLikeFractionsWithVariables">adding together the two like fractions</SkillLink>. You also learn the opposite: splitting the fraction again, like turning <M>\frac(3b+2a)(12ab)</M> into <M>\frac(1)(4a) + \frac(1)(6b)</M>. This includes <SkillLink skillId="addLikeFractionsWithVariables">splitting into like fractions</SkillLink> and subsequently <SkillLink skillId="simplifyFractionWithVariables">simplifying the resulting fractions</SkillLink>. The skill does not include <SkillLink skillId="expandBrackets">expanding brackets</SkillLink> or dealing with <SkillLink skillId="simplifyFractionOfFractionsWithVariables">fractions inside of fractions</SkillLink>.</Par>
	</Translation>
}
