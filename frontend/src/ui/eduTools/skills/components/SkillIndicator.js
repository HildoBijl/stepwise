import React from 'react'
import { useParams } from 'react-router-dom'

import { useSkillData } from 'api/skill'

import { SkillFlask } from './SkillFlask'

export function SkillIndicator() {
	const { skillId } = useParams()
	const skill = useSkillData(skillId)

	// Check if we have data.
	if (!skill)
		return null

	return <SkillFlask skillId={skillId} coef={skill.coefficients} strongShadow={true} sx={theme => ({
		height: '34px',
		ml: 2,
		width: '34px',
		[`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
			height: '28px',
			width: '28px',
		},
		[theme.breakpoints.up('sm')]: {
			height: '40px',
			width: '40px',
		},
	})} />
}
