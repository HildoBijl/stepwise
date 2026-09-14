import React from 'react'

import { moduleTree } from '@step-wise/module-tree'

import { TitleItem } from 'ui/routingTools'

import { useSkillId } from '../util'

export function SkillName() {
	const skillId = useSkillId()
	const skill = moduleTree[skillId]
	const skillNames = 'eduContent/skillNames'
	if (!skill || !skill.name)
		return <TitleItem path={skillNames} entry={`miscellaneous.unknownSkill`} name="Unknown skill" />
	return <TitleItem path={skillNames} entry={`${skill.groupPath.join('.')}.${skill.id}`} name={skill?.name} />
}
