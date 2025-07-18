import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { darken } from '@material-ui/core/styles/colorManipulator'

import { skillTree } from 'step-wise/eduTools'

import { useGetTranslation } from 'i18n'
import { linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { Button, QuickPractice } from 'ui/components'

import { strFreePractice } from '../../courses'

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

export function SkillRecommender({ courseCode, recommendation }) {
	const getTranslation = useGetTranslation()
	const paths = usePaths()
	const classes = useStyles()

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
	return (
		<Link to={link} className={classes.skillRecommenderLink}>
			<Button variant="contained" color="info" startIcon={<QuickPractice />} className={classes.skillRecommender}>
				<span className="buttonInner">{message}</span>
			</Button>
		</Link>
	)
}
