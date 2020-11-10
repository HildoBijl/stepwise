import React from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import { Check } from '@material-ui/icons'

import skills from 'step-wise/edu/skills'

import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import QuickPractice from 'ui/components/icons/QuickPractice'

import { useSkillData } from '../skills/SkillCacher'
import SkillFlask from '../skills/SkillFlask'
import { isPracticeNeeded } from '../skills/util'

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
			...linkStyleReset,

			'&.dummy': {
				cursor: 'auto',
				minHeight: '3.5rem',
			},

			'&:hover:not(.dummy)': {
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
				'&:hover:not(.dummy)': {
					background: fade(theme.palette.primary.main, 0.1),
				},
			},
		},
	},
}))

export default function SkillList({ courseId, skillIds, landscape, isPriorKnowledge, analysis }) {
	const classes = useStyles()

	// If there are no skills, add a note that skills will be added in the future.
	if (skillIds.length === 0) {
		return (
			<Box boxShadow={landscape ? 1 : 0} className={clsx(classes.skillList, 'skillList', { landscape })}>
				<SkillItem />
			</Box>
		)
	}

	return (
		<Box boxShadow={landscape ? 1 : 0} className={clsx(classes.skillList, 'skillList', { landscape })}>
			{skillIds.map((skillId) => <SkillItem
				key={skillId}
				courseId={courseId}
				skillId={skillId}
				isPriorKnowledge={isPriorKnowledge}
				recommend={skillId === analysis.recommendation}
				practiceNeeded={analysis.practiceNeeded[skillId]}
			/>)}
		</Box>
	)
}

function SkillItem({ courseId, skillId, isPriorKnowledge, recommend = false, practiceNeeded = 2 }) {
	const paths = usePaths()
	const skillData = useSkillData(skillId)

	// If there is no data, show that skills will be added in the future.
	if (!skillId) {
		return <div className="skillItem dummy">Er zijn nog geen opgaven toegevoegd hier. Ze komen er zo snel mogelijk aan.</div>
	}

	// Determine the tooltip to show under a "mastered" checkmark.
	let iconText = ''
	if (practiceNeeded === 0) {
		if (isPracticeNeeded(skillData, isPriorKnowledge) === 0)
			iconText = 'Je beheerst deze vaardigheid goed.'
		else
			iconText = 'Je beheerst een vervolg-vaardigheid, dus markeren we deze ook als voldoende.'
	}

	const skill = skills[skillId]
	return (
		<Link to={paths.courseSkill({ courseId, skillId })} className={clsx('skillItem', { recommend })}>
			{skillData ? <SkillFlask coef={skillData.coefficients} size={40} /> : null}
			<div className="skillName">{skill.name}</div>
			{practiceNeeded === 0 ? (
				<Tooltip title={iconText} arrow>
					<div className="iconContainer">
						<Check className="check" />
					</div>
				</Tooltip>
			) : null}
			{recommend ? (
				<Tooltip title="Dit is nu de optimale vaardigheid om te oefenen." arrow>
					<div className="iconContainer">
						<QuickPractice />
					</div>
				</Tooltip>
			) : null}
		</Link>
	)
}