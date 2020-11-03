import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'

import skills from 'step-wise/edu/skills'

import { notSelectable } from 'ui/theme'
import { usePaths } from 'ui/routing'
import QuickPractice from 'ui/components/QuickPractice'

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
				background: fade(theme.palette.primary.main, 0.03),
			},

			'&.recommend': {
				fontWeight: 'bold',
			},

			'& .skillFlask': {
				flex: '0 0 auto',
				marginRight: '0.8rem',
			},
			'& .skillName': {
				flex: '1 1 auto',
			},
			'& .recommendation': {
				height: '2.5rem',
				width: '2.5rem',
			},
		},

		'&.landscape': {
			borderRadius: '0.5rem',

			'& .skillItem': {
				background: fade(theme.palette.primary.main, 0.03),
				'&:hover': {
					background: fade(theme.palette.primary.main, 0.1),
				},
			},
		},
	},
}))

export default function SkillList({ skillIds, landscape, recommendation }) {
	const classes = useStyles()
	return (
		<Box boxShadow={landscape ? 1 : 0} className={clsx(classes.skillList, 'skillList', { landscape })}>
			{skillIds.map((skillId, index) => <SkillItem key={skillId} skillId={skillId} recommend={skillId === recommendation} />)}
		</Box>
	)
}

function SkillItem({ skillId, recommend = false }) {
	const skillData = useSkillData(skillId)
	const skill = skills[skillId]
	const paths = usePaths()

	if (!skillData)
		return null
	return (
		<Tooltip title={recommend ? 'Dit is voor jou nu de optimale vaardigheid om te oefenen.' : ''} arrow>
			<Link to={paths.skill({ skillId })} className={clsx('skillItem', { recommend })}>
				<SkillFlask coef={skillData.coefficients} size={40} />
				<div className="skillName">{skill.name}</div>
				{recommend ? <QuickPractice /> : null}
			</Link>
		</Tooltip>
	)
}