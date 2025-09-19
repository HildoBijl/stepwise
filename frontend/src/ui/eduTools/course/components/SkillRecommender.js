import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, darken } from '@mui/material'

import { skillTree } from 'step-wise/eduTools'

import { useGetTranslation } from 'i18n'
import { linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { QuickPractice } from 'ui/components'

import { strFreePractice } from '../../courses'

export function SkillRecommender({ courseCode, recommendation }) {
	const getTranslation = useGetTranslation()
	const paths = usePaths()

	// If there is no recommendation, not all data is loaded yet.
	if (!recommendation)
		return null

	// Determine what to show on the button.
	let link, message
	if (recommendation === strFreePractice) {
		link = paths.freePractice({ courseCode })
		message = getTranslation('freePracticeRecommendation', 'eduTools/pages/coursesPage')
	} else {
		link = paths.courseSkill({ courseCode, skillId: recommendation })
		const skill = skillTree[recommendation]
		message = `${getTranslation('skillRecommendation', 'eduTools/pages/coursesPage')} ${getTranslation(`${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames')}`
	}

	// Show the button.
	return <Link to={link} style={linkStyleReset}>
		<Button variant="contained" color="info" startIcon={<QuickPractice />} sx={theme => ({
			borderRadius: '0.5rem',
			justifyContent: 'flex-start',
			marginBottom: '0.6rem',
			minHeight: '3rem',
			padding: '0.4rem 1.2rem',
			width: '100%',
			'&:hover': { background: darken(theme.palette.info.main, 0.2) },
		})}>
			<Box component="span" sx={{ marginLeft: '0.2rem', textAlign: 'left' }}>{message}</Box>
		</Button>
	</Link>
}
