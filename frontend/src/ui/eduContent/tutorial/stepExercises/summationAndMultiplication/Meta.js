import React from 'react'

import { Translation } from 'i18n'
import { Par, Term, M } from 'ui/components'
import { SkillLink } from 'ui/eduTools'

export function Meta() {
	return <Translation entry="learningGoals">
		<Par>The goal of this skill is to show how different skills are combined into a <Term>composite skill</Term>. In this skill, students calculate an expression like <M>5 + 3 \cdot 2</M>, where they first have to <SkillLink skillId="multiplication">multiply</SkillLink> numbers and then <SkillLink skillId="summation">add</SkillLink> them.</Par>
	</Translation>
}
