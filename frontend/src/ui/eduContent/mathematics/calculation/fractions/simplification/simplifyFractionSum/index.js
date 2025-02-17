import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>simplify a fraction sum</Term>. This relates to both sums of fractions as well as fractions with sums. If you for instance have <M>2\frac(7\left(2+6\right))(17-5) - 8</M> then you will be able to reduce the sums within the fraction, simplify the fraction as much as possible, subsequently add all terms together and simplify the final result. For the example, the result would be <M>\frac(4)(3)</M>. This skill does not involve <SkillLink skillId="multiplyDivideFractions">multiplying/dividing fractions</SkillLink> or <SkillLink skillId="simplifyFractionOfFractions">simplifying fractions within fractions</SkillLink>.</Par>
	</Translation>
}
