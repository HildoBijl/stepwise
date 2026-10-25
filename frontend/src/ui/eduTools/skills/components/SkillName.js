import React from 'react'

import { TitleItem } from 'ui/routingTools'

import { useSkillId } from '../util'
import { useSkillName } from './TranslatedSkillName'

export function SkillName() {
	const skillId = useSkillId()
	return <TitleItem name={useSkillName(skillId)} />
}
