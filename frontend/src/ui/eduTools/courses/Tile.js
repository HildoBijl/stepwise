import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Tooltip, Box, alpha } from '@mui/material'

import { skillTree } from 'step-wise/eduTools'

import { useTranslator } from 'i18n'
import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routingTools'
import { Button, ProgressIndicator, QuickPractice } from 'ui/components'

import { getOrganization } from '../organizations'

import { strFreePractice } from './util'

// Set up style for a tile.
const getTileStyle = buttonHover => (theme => ({
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
	'&:hover': { background: alpha(theme.palette.primary.main, buttonHover ? 0.03 : 0.1) },
}))

export function Tile({ course, skillsTotal, skillsDone, recommendation }) {
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

	const organization = getOrganization(course.organization)
	return <Link to={paths.course({ courseCode: course.code })} style={{ textDecoration: 'none', ...notSelectable }}>
		<Box boxShadow={1} sx={getTileStyle(buttonHover)}>
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
				<ProgressIndicator total={skillsTotal} done={skillsDone} size={60} />
				<Box>
					<Tooltip title={tooltip} arrow sx={{ maxWidth: '12rem', textAlign: 'center' }}>
						<Button variant="contained" color="info" onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)} onClick={goToRecommendation} sx={{ borderRadius: '0.5rem', height: '3rem', minWidth: 0, padding: 0, width: '3rem' }}>
							<QuickPractice />
						</Button>
					</Tooltip>
				</Box>
			</Box>
		</Box>
	</Link >
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
