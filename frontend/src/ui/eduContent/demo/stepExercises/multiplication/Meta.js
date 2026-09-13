import React from 'react'

import { M } from '@step-wise/math-display'

import { Translation } from 'i18n'
import { Par, Term } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>This skill focuses on <Term>multiplying two numbers</Term>. It builds up to to a combined skill where we both <SkillLink skillId="summationAndMultiplication">add and multiply numbers</SkillLink>. The numbers that are used are both small: at most <M>10</M>.</Par>
	</Translation>
}
