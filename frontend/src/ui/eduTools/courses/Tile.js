import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tooltip, Box, alpha } from '@mui/material'

import { skillTree, processCourse } from 'step-wise/eduTools'

import { useTranslator, Translation, Plurals } from 'i18n'
import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { Button, ProgressIndicator, QuickPractice } from 'ui/components'

import { getOrganization } from '../organizations'

import { strFreePractice } from './util'

// Set up style for a tile.
const getTileStyle = preventHoverStyle => (theme => ({
	alignItems: 'stretch',
	background: alpha(theme.palette.primary.main, 0.03),
	borderRadius: '0.5rem',
	cursor: 'pointer',
	display: 'flex',
	flexFlow: 'column nowrap',
	height: '100%',
	overflow: 'hidden',
	padding: '0.3rem',
	position: 'relative',
	...linkStyleReset,
	'&:hover': { background: alpha(theme.palette.primary.main, preventHoverStyle ? 0.03 : 0.1) },
}))


export function Tile({ course, preventHoverStyle, children }) {
	const translate = useTranslator()
	const paths = usePaths()

	const organization = getOrganization(course.organization)
	return <Link to={paths.course({ courseCode: course.code })} style={{ textDecoration: 'none', ...notSelectable }}>
		<Box boxShadow={1} sx={getTileStyle(preventHoverStyle)}>
			<Box component="img" src={organization.logo} alt={`Logo ${organization.name}`} sx={{
				objectFit: 'contain',
				opacity: 0.05,
				position: 'absolute',
				height: '90%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: '90%',
				top: '50%',
				...notSelectable,
			}} />
			<Box sx={{ alignItems: 'center', display: 'flex', flexFlow: 'row nowrap', height: '35%' }}>
				<Box sx={{ fontWeight: 500, textAlign: 'center', width: '100%' }}>
					{translate(course.name, `${course.organization}.${course.code}.name`, 'eduContent/courseInfo')}
				</Box>
			</Box>
			<Box sx={{ alignItems: 'center', display: 'flex', flexFlow: 'row nowrap', height: '65%', justifyContent: 'space-evenly' }}>
				{children}
			</Box>
		</Box>
	</Link>
}

export function StudentTile({ course, skillsTotal, skillsDone, recommendation }) {
	const translate = useTranslator()
	const paths = usePaths()
	const [buttonHover, setButtonHover] = useState(false)
	const navigate = useNavigate()

	// Set up recommendation tooltip.
	let tooltip
	switch (recommendation) {
		case undefined:
			tooltip = translate('Your progress is being loaded...', 'loadingSkillData')
			break
		case strFreePractice:
			tooltip = translate('You have all skills on a sufficient level! The next step is the free practice mode.', 'freePracticeRecommendation')
			break
		default:
			const skill = skillTree[recommendation]
			tooltip = <>{translate(`Our practice recommendation:`, 'skillRecommendation')} {translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames')}</>
			break
	}

	// Set up recommendation handler.
	const goToRecommendation = (evt) => {
		evt.preventDefault() // Prevent the tile link from working.
		if (recommendation === strFreePractice)
			navigate(paths.freePractice({ courseCode: course.code }))
		else if (recommendation)
			navigate(paths.courseSkill({ courseCode: course.code, skillId: recommendation }))
	}

	// Render the contents within the tile.
	return <Tile course={course} preventHoverStyle={buttonHover}>
		<ProgressIndicator total={skillsTotal} done={skillsDone} size={60} />
		<Box>
			<Tooltip title={tooltip} arrow sx={{ maxWidth: '12rem', textAlign: 'center' }}>
				<Button variant="contained" color="info" onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)} onClick={goToRecommendation} sx={{ borderRadius: '0.5rem', height: '3rem', minWidth: 0, padding: 0, width: '3rem' }}>
					<QuickPractice />
				</Button>
			</Tooltip>
		</Box>
	</Tile>
}

export function TeacherTile({ course }) {
	// Process the course.
	const processedCourse = useMemo(() => processCourse(course), [course])

	// Define styles.
	const containerStyle = { textAlign: 'center' }
	const numberStyle = {
		fontSize: '1.6rem',
		fontWeight: 600,
		color: theme => theme.palette.primary.main,
		lineHeight: 1,
	}
	const labelStyle = {
		fontSize: '0.75rem',
		fontWeight: 500,
		color: theme => theme.palette.text.secondary,
		mt: 0.5,
	}

	// Render the tile part.
	return <Tile course={course}>
		<Box sx={containerStyle}>
			<Box sx={numberStyle}>{processedCourse.contents.length}</Box>
			<Box sx={labelStyle}>
				<Translation entry="tiles.skills">
					<Plurals value={processedCourse.contents.length}>
						<Plurals.One>Skill</Plurals.One>
						<Plurals.NotOne>Skills</Plurals.NotOne>
					</Plurals>
				</Translation>
			</Box>
		</Box>
		<Box sx={containerStyle}>
			<Box sx={numberStyle}>{course.students.length}</Box>
			<Box sx={labelStyle}>
				<Translation entry="tiles.students">
					<Plurals value={course.students.length}>
						<Plurals.One>Student</Plurals.One>
						<Plurals.NotOne>Students</Plurals.NotOne>
					</Plurals>
				</Translation>
			</Box>
		</Box>
	</Tile >
}

export function AddCourseTile() {
	const translate = useTranslator()
	const paths = usePaths()
	return <Link to={paths.addCourse()} style={{ textDecoration: 'none', ...notSelectable }}>
		<Box boxShadow={1} sx={getTileStyle(false)}>
			<Box sx={{ fontWeight: 100, fontSize: '5rem', margin: '-0.4rem 0 -1.4rem', textAlign: 'center', width: '100%' }}>+</Box>
			<Box sx={{ fontWeight: 500, textAlign: 'center', width: '100%' }}>{translate('Add course', 'addCourse')}</Box>
		</Box>
	</Link>
}
