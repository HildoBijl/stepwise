import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a linear equation</Term>. If you have an equation like <M>2\left(x+3\right)=4x+5</M> then you will be able to determine the solution for <M>x</M>. This includes <SkillLink skillId="expandBrackets">expanding any potential brackets</SkillLink>, <SkillLink skillId="moveEquationTerm">moving terms around</SkillLink>, <SkillLink skillId="mergeSimilarTerms">merging similar terms</SkillLink> together and eventually <SkillLink skillId="solveProductEquation">solving the resulting product equation</SkillLink>. The latter also includes simplifying the result as well as checking it. This skill does not deal with equations with fractions containing <M>x</M> in the denominator, which is left for a <SkillLink skillId="solveLinearEquationWithFractions">follow-up skill</SkillLink>.</Par>
	</Translation>
}
