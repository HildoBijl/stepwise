import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import { Check } from '@material-ui/icons'

import skills from 'step-wise/edu/skills'

import { notSelectable } from 'ui/theme'
import { usePaths } from 'ui/routing'
import QuickPractice from 'ui/components/QuickPractice'

import { useSkillData } from '../../skills/SkillCacher'
import SkillFlask from '../../skills/SkillFlask'

import { isSkillMastered } from '../util'
import { isPracticeNeeded } from '../../skills/util'

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
			'& .iconContainer': {
				lineHeight: 0,

				'& .check': {
					color: theme.palette.success.main,
				},
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

export default function SkillList({ skillIds, landscape, isPriorKnowledge, recommendation, masteredSkills }) {
	const classes = useStyles()
	return (
		<Box boxShadow={landscape ? 1 : 0} className={clsx(classes.skillList, 'skillList', { landscape })}>
			{skillIds.map((skillId, index) => <SkillItem key={skillId} skillId={skillId} isPriorKnowledge={isPriorKnowledge} recommend={skillId === recommendation} mastered={isSkillMastered(skillId, masteredSkills)} />)}
		</Box>
	)
}

function SkillItem({ skillId, isPriorKnowledge, recommend = false, mastered = false }) {
	const skillData = useSkillData(skillId)
	const skill = skills[skillId]
	const paths = usePaths()

	let iconText = ''
	if (mastered) {
		const practiceNeeded = isPracticeNeeded(skillData, isPriorKnowledge)
		if (practiceNeeded === 0)
			iconText = 'Je beheerst deze vaardigheid goed.'
		else if (practiceNeeded === 1)
			iconText = 'Je beheerst deze vaardigheid voldoende om door te kunnen.'
		else
			iconText = 'Je beheerst een vervolg-vaardigheid, dus markeren we deze ook als voldoende.'
	}

	if (!skillData)
		return null
	return (
		<Link to={paths.skill({ skillId })} className={clsx('skillItem', { recommend })}>
			<SkillFlask coef={skillData.coefficients} size={40} />
			<div className="skillName">{skill.name}</div>
			{mastered ? <Tooltip title={iconText} arrow><div className="iconContainer"><Check className="check" /></div></Tooltip> : null}
			{recommend && !mastered ? <Tooltip title="Dit is nu de optimale vaardigheid om te oefenen." arrow><div className="iconContainer"><QuickPractice /></div></Tooltip> : null}
		</Link>
	)
}