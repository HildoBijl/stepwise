import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { darken } from '@material-ui/core/styles/colorManipulator'

import skills from 'step-wise/edu/skills'

import { linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import QuickPractice from 'ui/components/QuickPractice'
import Button from 'ui/components/Button'

const useStyles = makeStyles((theme) => ({
	skillRecommenderLink: linkStyleReset,
	skillRecommender: {
		borderRadius: '0.5rem',
		justifyContent: 'flex-start',
		marginBottom: '0.6rem',
		padding: '0.7rem 1.2rem',
		width: '100%',

		'&:hover': {
			background: darken(theme.palette.info.main, 0.2),
		},
	},
}))

export default function SkillRecommender({ recommendation }) {
	const paths = usePaths()
	const classes = useStyles()

	// If there is no recommendation (all work is done) then give an alternative.
	if (!recommendation) {
		return ( // ToDo later: add a free practice mode, browsing through the end goals.
			<Button variant="contained" color="info" startIcon={<QuickPractice />} className={classes.skillRecommender}>Je hebt alles op voldoende niveau!</Button>
		)
	}

	// Give a link to the recommended skill.
	const skill = skills[recommendation]
	return (
		<Link to={paths.skill({ skillId: recommendation })} className={classes.skillRecommenderLink}>
			<Button variant="contained" color="info" startIcon={<QuickPractice />} className={classes.skillRecommender}>Direct oefenen: {skill.name}</Button>
		</Link>
	)
}