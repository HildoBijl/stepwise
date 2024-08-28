import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>cancel sum terms</Term>. For instance when seeing <M>2x - x^2 - 2x</M> you should immediately realize that adding <M>2x</M> and later on subtracting <M>2x</M> has no effect. Both terms can therefore be removed from the summation, leaving <M>-x^2</M>. This skill only deals with canceling identical terms, and not with <SkillLink skillId="mergeSimilarTerms">merging similar terms</SkillLink> like <M>2x^2 + 3x^2</M>.</Par>
	</Translation>
}
