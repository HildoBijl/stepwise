import React from 'react'

import { skillTree } from 'step-wise/edu/skills'

import { TitleItem } from 'ui/layout/Title'

import { useSkillId } from '../util'

export default function SkillName() {
	const skillId = useSkillId() // ToDo later: add error handling if skill ID is not known.
	const skill = skillTree[skillId]
	return <TitleItem name={skill?.name || 'Unknown skill'} />
}
