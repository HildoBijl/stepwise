import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify products with powers in them</Term>. This could be the product of two powers, turning <M>x^2 \cdot x^3</M> into <M>x^5</M>, it could be the power of a product, turning <M>\left(2x\right)^3</M> into <M>8x^3</M>, or it could be the power of a power, turning <M>\left(x^2\right)^3</M> into <M>x^6</M>. It basically includes any rewriting where you have to keep in mind that a power is nothing more than a <SkillLink skillId="rewritePower">repeated multiplication</SkillLink>. This skill also includes the potential <SkillLink skillId="simplifyNumberProduct">simplification of number products</SkillLink>. It does not include <SkillLink skillId="rewriteNegativePower">negative powers</SkillLink> like <M>x^(-3)</M>, <SkillLink skillId="simplifyFractionWithVariables">fractions</SkillLink> like <M>\frac(x^5)(x^3)</M> or expanding <SkillLink skillId="expandPowerOfSum">powers of sums</SkillLink> like <M>\left(2x+3\right)^3</M>.</Par>
	</Translation>
}
