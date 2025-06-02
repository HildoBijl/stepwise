import React from 'react'

import { skillTree } from 'step-wise/eduTools'

import { TitleItem } from 'ui/routingTools'

import { useSkillId } from '../util'

export function SkillName() {
	const skillId = useSkillId() // ToDo later: add error handling if skill ID is not known.
	const skill = skillTree[skillId]
	const skillNames = 'eduContent/skillNames'
	if (!skill || !skill.name)
		return <TitleItem path={skillNames} entry={`miscellaneous.unknownSkill`} name="Unknown skill" />
	return <TitleItem path={skillNames} entry={`${skill.path.join('.')}.${skill.id}`} name={skill?.name} />
}
