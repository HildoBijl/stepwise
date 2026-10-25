import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, darken } from '@mui/material'

import { freePracticeRecommendation } from '@step-wise/course-analysis'
import { useTextTranslation } from '@step-wise/i18n'

import { linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { QuickPractice } from 'ui/components'

import { TranslatedSkillName } from '../../skills/components/TranslatedSkillName'

export function SkillRecommender({ courseCode, recommendation }) {
	const freePracticeText = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'coursesPage', group: [], id: 'freePracticeRecommendation', source: 'You have all skills on a sufficient level! The next step is the free practice mode.' })
	const recommendationText = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'coursesPage', group: [], id: 'skillRecommendation', source: 'Our practice recommendation:' })
	const paths = usePaths()

	// If there is no recommendation, not all data is loaded yet.
	if (!recommendation)
		return null

	// Determine what to show on the button.
	let link, message
	if (recommendation === freePracticeRecommendation) {
		link = paths.freePractice({ courseCode })
		message = freePracticeText
	} else {
		link = paths.courseSkill({ courseCode, skillId: recommendation })
		message = <>{recommendationText} <TranslatedSkillName skillId={recommendation} /></>
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
