import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>In this skill you learn to <Term>solve a quadratic equation</Term> when it is in its standard form <M>ax^2 + bx + c</M>. For instance, with <M>2x^2 - 12x + 18 = 0</M> you can determine there is one solution <M>x = 3</M>, with <M>2x^2 - 12x + 16 = 0</M> you can find the two solutions <M>x = 3 \pm 1</M> and reduce this to <M>x = 2</M> and <M>x = 4</M>, and with <M>2x^2 - 12x + 8 = 0</M> you can end up at <M>x = 3 \pm \sqrt(5)</M>. This includes determining the number of solutions, <SkillLink skillId="simplifyRoot">simplifying the square root</SkillLink> (pulling out factors) and <SkillLink skillId="simplifyFractionSum">simplifying the resulting fraction</SkillLink>. This skill does not include <SkillLink skillId="solveRewrittenQuadraticEquation">rewritten quadratic equations</SkillLink> which still have to be <SkillLink skillId="bringToStandardForm">brought to standard form</SkillLink> first.</Par>
	</Translation>
}
