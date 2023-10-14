import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { darken } from '@material-ui/core/styles/colorManipulator'

import { useGetTranslation } from 'i18n'
import { linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import { Button, QuickPractice } from 'ui/components'

import { strFreePractice } from './util'

const useStyles = makeStyles((theme) => ({
	skillRecommenderLink: linkStyleReset,
	skillRecommender: {
		borderRadius: '0.5rem',
		justifyContent: 'flex-start',
		marginBottom: '0.6rem',
		minHeight: '3rem',
		padding: '0.4rem 1.2rem',
		width: '100%',

		'&:hover': {
			background: darken(theme.palette.info.main, 0.2),
		},

		'& .buttonInner': {
			marginLeft: '0.2rem',
			textAlign: 'left',
		},
	},
}))

export default function SkillRecommender({ courseId, recommendation }) {
	const getTranslation = useGetTranslation()
	const paths = usePaths()
	const classes = useStyles()

	// If there is no recommendation, not all data is loaded yet.
	if (!recommendation)
		return null

	// Determine what to show on the button.
	let link, message
	if (recommendation === strFreePractice) {
		link = paths.freePractice({ courseId })
		message = getTranslation('freePracticeRecommendation', 'pages/courses')
	} else {
		link = paths.courseSkill({ courseId, skillId: recommendation })
		message = `${getTranslation('skillRecommendation', 'pages/courses')} ${getTranslation(`${recommendation}.name`, 'edu/skills/skillInfo')}`
	}

	// Show the button.
	return (
		<Link to={link} className={classes.skillRecommenderLink}>
			<Button variant="contained" color="info" startIcon={<QuickPractice />} className={classes.skillRecommender}>
				<span className="buttonInner">{message}</span>
			</Button>
		</Link>
	)
}
