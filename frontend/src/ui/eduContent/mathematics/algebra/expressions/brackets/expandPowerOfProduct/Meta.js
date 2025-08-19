import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>expand brackets for a power of a product</Term>. If you see an expression like <M>\left(2x\right)^3</M> you can turn this into <M>2^3 x^3</M> which subsequently becomes <M>8x^3</M>. This includes <SkillLink skillId="simplifyNumberProduct">simplifying products of numbers</SkillLink> into a single number. It may also include <SkillLink skillId="rewriteNegativePower">rewriting negative powers</SkillLink> like turning <M>\left(2x\right)^(-3)</M> into <M>\frac(1)(8x^3)</M>.</Par>
	</Translation>
}
