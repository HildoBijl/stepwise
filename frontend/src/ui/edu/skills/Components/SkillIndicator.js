import React from 'react'
import { useParams } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import { useSkillData } from 'api/skill'

import SkillFlask from './SkillFlask'

const useStyles = makeStyles((theme) => ({
	skillIndicator: { // Match the toolbar style boundaries.
		height: '34px',
		marginLeft: theme.spacing(2),
		width: '34px',
		[`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
			height: '28px',
			width: '28px',
		},
		[theme.breakpoints.up('sm')]: {
			height: '40px',
			width: '40px',
		},
	},
}))

export default function SkillIndicator() {
	const { skillId } = useParams()
	const skill = useSkillData(skillId)
	const classes = useStyles()

	// Check if we have data.
	if (!skill)
		return null

	return <SkillFlask className={classes.skillIndicator} skillId={skillId} coef={skill.coefficients} strongShadow={true} />
}
