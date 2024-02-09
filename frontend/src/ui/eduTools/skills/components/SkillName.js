import React from 'react'

import { skillTree } from 'step-wise/eduTools'

import { TitleItem } from 'ui/routingTools'

import { useSkillId } from '../util'

export function SkillName() {
	const skillId = useSkillId() // ToDo later: add error handling if skill ID is not known.
	const skill = skillTree[skillId]
	const skillInfoPath = 'eduContent/skillInfo'
	if (!skill || !skill.name)
		return <TitleItem path={skillInfoPath} entry={`unknownSkill.name`} name="Unknown skill" />
	return <TitleItem path={skillInfoPath} entry={`${skillId}.name`} name={skill?.name} />
}
