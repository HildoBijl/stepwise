import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>move a term to the other side of an equation</Term>. If you start with an equation like <M>x^2 + 4x = -5</M> you can bring the term <M>4x</M> to the right to get <M>x^2 = -5 - 4x</M>, or you can bring the <M>5</M> to the left to get <M>x^2 + 4x + 5 = 0</M>. This includes understanding why this is allowed: <SkillLink skillId="addToBothEquationSides">adding/subtracting a term to both sides of the equation</SkillLink> and subsequently <SkillLink skillId="cancelSumTerms">canceling identical sum terms</SkillLink>. This skill does not include reasoning about which term would be wise to move.</Par>
	</Translation>
}
