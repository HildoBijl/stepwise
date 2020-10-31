import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'

import skills from 'step-wise/edu/skills'

import { notSelectable } from 'ui/theme'
import { usePaths } from 'ui/routing'

import { useSkillData } from '../../skills/SkillCacher'
import SkillFlask from '../../skills/SkillFlask'

const useStyles = makeStyles((theme) => ({
	skillList: {
		overflow: 'hidden',
		...notSelectable,

		'& .skillItem': {
			alignItems: 'center',
			color: theme.palette.text.primary,
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			padding: '0.8rem',
			textDecoration: 'none',
			width: '100%',

			'&:hover': {
				background: fade(theme.palette.primary.main, 0.05),
			},

			'& .skillFlask': {
				flex: '0 0 auto',
				marginRight: '0.8rem',
			},
			'& .skillName': {
				flex: '1 1 auto',
			},
		},

		'&.landscape': {
			borderRadius: '0.5rem',

			'& .skillItem': {
				background: fade(theme.palette.primary.main, 0.05),
				'&:hover': {
					background: fade(theme.palette.primary.main, 0.1),
				},
			},
		},
	},
}))

export default function SkillList({ skillIds, landscape }) {
	const classes = useStyles()
	return (
		<Box boxShadow={landscape ? 1 : 0} className={clsx(classes.skillList, 'skillList', { landscape })}>
			{skillIds.map((skillId, index) => <SkillItem key={skillId} skillId={skillId} />)}
		</Box>
	)
}

function SkillItem({ skillId }) {
	const skillData = useSkillData(skillId)
	const skill = skills[skillId]
	const paths = usePaths()

	if (!skillData)
		return null
	return (
		<Link to={paths.skill({ skillId })} className="skillItem">
			<SkillFlask coef={skillData.coefficients} size={40} />
			<div className="skillName">{skill.name}</div>
		</Link>
	)
}