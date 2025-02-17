import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>bring an equation to the standard form</Term> <M>x^n + c_(n-1)x^(n-1) + \ldots + c_1x + c_0 = 0</M>. If you have an equation like <M>2 + \frac(3)(x+5)=\frac(7)(x+9)</M> then you will be able to get <M>x</M> <SkillLink skillId="multiplyAllEquationTerms">out of the denominator</SkillLink>, <SkillLink skillId="expandDoubleBrackets">expand all brackets</SkillLink>, <SkillLink skillId="moveEquationTerm">move all terms</SkillLink> to the left and <SkillLink skillId="multiplyAllEquationTerms">normalize</SkillLink> the result to get <M>x^2 + 21x + 42 = 0</M>. The skill only deals with rational equations and not with equations with roots or other types of functions.</Par>
	</Translation>
}
