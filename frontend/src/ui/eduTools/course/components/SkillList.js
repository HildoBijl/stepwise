import React from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import { Check } from '@material-ui/icons'

import { skillTree } from 'step-wise/eduTools'

import { useSkillData } from 'api/skill'
import { Translation, useTranslator } from 'i18n'
import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import { QuickPractice } from 'ui/components/icons'

import { SkillFlask, isPracticeNeeded } from '../../../edu/skills'

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
				background: alpha(theme.palette.primary.main, 0.03),
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
				background: alpha(theme.palette.primary.main, 0.03),
				'&:hover:not(.dummy)': {
					background: alpha(theme.palette.primary.main, 0.1),
				},
			},
		},
	},
}))

export function SkillList({ courseId, skillIds, display = true, landscape, isPriorKnowledge, analysis }) {
	const classes = useStyles()

	// If we should not display this skill list, show nothing instead.
	if (!display)
		return <div className={clsx(classes.skillList, 'skillList', { landscape })} />

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
				recommend={skillId === analysis?.recommendation}
				practiceNeeded={analysis && analysis.practiceNeeded[skillId]}
			/>)}
		</Box>
	)
}

function SkillItem({ courseId, skillId, isPriorKnowledge, recommend = false, practiceNeeded = 2 }) {
	const translate = useTranslator()
	const paths = usePaths()
	const skillData = useSkillData(skillId)

	// If there is no data, show that skills will be added in the future.
	if (!skillId)
		return <div className="skillItem dummy"><Translation entry="noSkills">This block is still under development: no skills/exercises have been added yet. They will be here shortly!</Translation></div>

	// Determine the tooltip to show under a "mastered" checkmark.
	let iconText = ''
	const skill = skillTree[skillId]
	if (practiceNeeded === 0) {
		if (isPracticeNeeded(skillData, isPriorKnowledge, skill.thresholds) === 0)
			iconText = translate('You have sufficiently mastered this skill.', 'sufficientMastery')
		else
			iconText = translate('You have mastered a follow-up skill, so we mark this one as sufficient as well.', 'followUpMastery')
	}

	return (
		<Link to={paths.courseSkill({ courseId, skillId })} className={clsx('skillItem', { recommend })}>
			{skillData ? <SkillFlask skillId={skillId} coef={skillData.coefficients} isPriorKnowledge={isPriorKnowledge} size={40} /> : null}
			<div className="skillName">{translate(skill.name, `${skill.id}.name`, 'eduContent/skillInfo')}</div>
			{practiceNeeded === 0 ? (
				<Tooltip title={iconText} arrow>
					<div className="iconContainer">
						<Check className="check" />
					</div>
				</Tooltip>
			) : null}
			{recommend ? (
				<Tooltip title={translate('This is currently the recommended skill to practice.', 'practiceRecommendation')} arrow>
					<div className="iconContainer">
						<QuickPractice />
					</div>
				</Tooltip>
			) : null}
		</Link>
	)
}
