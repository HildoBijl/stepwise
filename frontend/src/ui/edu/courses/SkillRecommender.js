import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { darken } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'

import skills from 'step-wise/edu/skills'

import { linkDeactivation } from 'ui/theme'
import { usePaths } from 'ui/routing'

const useStyles = makeStyles((theme) => ({
	skillRecommenderLink: linkDeactivation,
	skillRecommender: {
		alignItems: 'center',
		background: theme.palette.info.main,
		borderRadius: '0.5rem',
		color: theme.palette.info.contrastText,
		display: 'flex',
		flexFlow: 'row nowrap',
		fontSize: '1rem',
		marginBottom: '0.6rem',
		padding: '0.8rem',
		textDecoration: 'none',
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
			<Box boxShadow={1} className={classes.skillRecommender}>
				<div className="text">Je hebt alles op voldoende niveau!</div>
			</Box>
		)
	}

	// Give a link to the recommended skill.
	const skill = skills[recommendation]
	return (
		<Link to={paths.skill({ skillId: recommendation })} className={classes.skillRecommenderLink}>
			<Box boxShadow={1} className={classes.skillRecommender}>
				<div className="text">Direct oefenen: {skill.name}</div>
			</Box>
		</Link>
	)
}