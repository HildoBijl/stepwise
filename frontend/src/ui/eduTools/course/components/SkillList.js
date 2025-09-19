import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Tooltip, useTheme, alpha } from '@mui/material'
import { Check, Info } from '@mui/icons-material'

import { skillTree } from 'step-wise/eduTools'

import { useSkillData } from 'api/skill'
import { Translation, useTranslator } from 'i18n'
import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { QuickPractice } from 'ui/components/icons'

import { isPracticeNeeded, SkillFlask } from '../../skills'

export function SkillList({ courseCode, skillIds, display = true, landscape, isPriorKnowledge, analysis, sx = {} }) {

	// If we should not display this skill list, show nothing instead.
	if (!display)
		return <Box />

	// Define the style for the skill list.
	const skillListStyle = {
		overflow: 'hidden',
		borderRadius: landscape ? '0.5rem' : undefined,
		...notSelectable,
	}

	// If there are no skills, add a note that skills will be added in the future.
	if (skillIds.length === 0) {
		return <Box boxShadow={landscape ? 1 : 0} sx={{ ...skillListStyle, ...sx }}>
			<SkillItem />
		</Box>
	}

	return <Box boxShadow={landscape ? 1 : 0} sx={{ ...skillListStyle, ...sx }}>
		{skillIds.map((skillId) => <SkillItem
			key={skillId}
			courseCode={courseCode}
			skillId={skillId}
			isPriorKnowledge={isPriorKnowledge}
			recommend={skillId === analysis?.recommendation}
			practiceNeeded={analysis && analysis.practiceNeeded[skillId]}
		/>)}
	</Box>
}

function SkillItem({ courseCode, skillId, isPriorKnowledge, recommend = false, practiceNeeded = 2, sx = {} }) {
	const theme = useTheme()
	const translate = useTranslator()
	const paths = usePaths()
	const skillData = useSkillData(skillId)

	// Define styling.
	const isDummy = !skillId
	const skillItemStyle = {
		alignItems: 'center',
		color: theme.palette.text.primary,
		cursor: 'pointer',
		display: 'flex',
		flexFlow: 'row nowrap',
		padding: '0.8rem',
		textDecoration: 'none',
		width: '100%',
		...linkStyleReset,
		...(recommend && { fontWeight: 'bold' }),
		...(isDummy && { cursor: 'auto', minHeight: '3.5rem' }),
		...(!isDummy && { '&:hover': { background: alpha(theme.palette.primary.main, 0.03) } }),
		...sx,
	}
	const iconContainerStyle = {
		lineHeight: 0,
	}

	// If there is no data, show that skills will be added in the future.
	if (!skillId)
		return <Box><Translation entry="noSkills">This block is still under development: no skills/exercises have been added yet. They will be here shortly!</Translation></Box>

	// Determine the tooltip to show under a "mastered" checkmark.
	let noExercisesText = '', masteryText = ''
	const skill = skillTree[skillId]
	if (skill.exercises.length === 0) {
		noExercisesText = translate('This skill has no exercises yet. They are probably coming soon.', 'noExercises')
	} else if (practiceNeeded === 0) {
		if (isPracticeNeeded(skillData, isPriorKnowledge, skill.thresholds) === 0)
			masteryText = translate('You have sufficiently mastered this skill.', 'sufficientMastery')
		else
			masteryText = translate('You have mastered a follow-up skill, so we mark this one as sufficient as well.', 'followUpMastery')
	}

	return <Box component={Link} to={paths.courseSkill({ courseCode, skillId })} sx={skillItemStyle}>
		{skillData ? <SkillFlask skillId={skillId} coef={skillData.coefficients} isPriorKnowledge={isPriorKnowledge} size={40} sx={{ flex: '0 0 auto', marginRight: '0.8rem' }} /> : null}
		<Box sx={{ flex: '1 1 auto' }}>{translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames')}</Box>
		{skill.exercises.length === 0 ? <Tooltip title={noExercisesText} arrow>
			<Box sx={iconContainerStyle}>
				<Info sx={theme => ({ color: theme.palette.info.main })} />
			</Box>
		</Tooltip> : (practiceNeeded === 0 ? <Tooltip title={masteryText} arrow>
			<Box sx={iconContainerStyle}>
				<Check sx={theme => ({ color: theme.palette.success.main })} />
			</Box>
		</Tooltip> : null)}
		{recommend ? <Tooltip title={translate('This is currently the recommended skill to practice.', 'practiceRecommendation')} arrow>
			<Box sx={iconContainerStyle}>
				<QuickPractice />
			</Box>
		</Tooltip> : null}
	</Box>
}
