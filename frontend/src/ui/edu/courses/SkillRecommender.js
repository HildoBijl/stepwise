import React, { useState, useCallback } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade, lighten, darken } from '@material-ui/core/styles/colorManipulator'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Collapse from '@material-ui/core/Collapse'
import Box from '@material-ui/core/Box'
import { ChevronRight as Arrow } from '@material-ui/icons'

import skills from 'step-wise/edu/skills'

import { notSelectable, linkDeactivation } from 'ui/theme'
import { usePaths } from 'ui/routing'

import { getCourseSkills } from './util'
import { getSkillRecommendation } from '../skills/util'
import { useSkillData, useSkillsData } from '../skills/SkillCacher'
import SkillFlask from '../skills/SkillFlask'

const useStyles = makeStyles((theme) => ({
	skillRecommenderLink: linkDeactivation,
	skillRecommender: {
		alignItems: 'center',
		background: theme.palette.info.main,
		borderRadius: '0.5rem',
		color: theme.palette.info.contrastText,
		display: 'flex',
		flexFlow: 'row nowrap',
		fontSize: '1.1rem',
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
	if (!recommendation)
		return <div>Klaar! TODO TEMP</div> // ToDo later: add a free practice mode, browsing through the end goals.

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