import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>expand brackets for a power of a sum</Term>. If you see an expression like <M>\left(2x-3\right)^3</M> you can turn this into <M>8x^3 - 36x^2 + 54x - 27</M>. This includes setting up the right format, taking <SkillLink skillId="simplifyProductOfPowers">powers of each of the terms</SkillLink>, looking up the right multiplication coefficients, and eventually <SkillLink skillId="simplifyNumberProduct">simplifying all individual terms</SkillLink>. This skill only considers sums with two terms, not dealing with expansions like <M>\left(x^2 + 2x + 1\right)^3</M> or similar. It also does not consider <SkillLink skillId="rewriteNegativePower">negative powers</SkillLink>.</Par>
	</Translation>
}
