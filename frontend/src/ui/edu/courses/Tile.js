import React, { useState } from 'react'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'

import { skillTree } from 'step-wise/edu/skills'

import { useTranslator } from 'i18n'
import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import { Button, ProgressIndicator, QuickPractice } from 'ui/components'

import { strFreePractice } from '../course/util'

const useStyles = makeStyles((theme) => ({
	tile: {
		...notSelectable,

		'& .tileBox': {
			alignItems: 'stretch',
			background: alpha(theme.palette.primary.main, 0.03),
			borderRadius: '0.5rem',
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'column nowrap',
			height: '100%',
			overflow: 'hidden',
			padding: '0.3rem',
			...linkStyleReset,

			'&:hover': {
				background: ({ buttonHover }) => alpha(theme.palette.primary.main, buttonHover ? 0.03 : 0.1),
			},

			'& .nameContainer': {
				alignItems: 'center',
				display: 'flex',
				flexFlow: 'row nowrap',
				height: '35%',

				'& .name': {
					fontWeight: 500,
					textAlign: 'center',
					width: '100%',
				},
			},
			'& .info': {
				alignItems: 'center',
				display: 'flex',
				flexFlow: 'row nowrap',
				height: '65%',
				justifyContent: 'space-evenly',

				'& .directPractice': {
					borderRadius: '0.5rem',
					height: '3rem',
					minWidth: 0,
					padding: 0,
					width: '3rem',
				},
			},
		},
	},
	tooltip: {
		maxWidth: '12rem',
		textAlign: 'center',
	},
}))

export default function Tile({ course, skillsTotal, skillsDone, recommendation }) {
	const translate = useTranslator()
	const paths = usePaths()
	const [buttonHover, setButtonHover] = useState(false)
	const navigate = useNavigate()
	const classes = useStyles({ buttonHover })

	// Set up recommendation tooltip.
	let tooltip
	switch (recommendation) {
		case undefined:
			tooltip = translate('Your progress is being loaded...', 'loadingNotification')
			break
		case strFreePractice:
			tooltip = translate('You have all skills on a sufficient level! The next step is the free practice mode.', 'freePracticeRecommendation')
			break
		default:
			tooltip = `${translate(`Our practice recommendation:`, 'skillRecommendation')} ${translate(skillTree[recommendation].name, `${recommendation}.name`, 'edu/skills/skillInfo')}`
			break
	}

	// Set up recommendation handler.
	const goToRecommendation = (evt) => {
		evt.preventDefault() // Prevent the tile link from working.
		if (recommendation === strFreePractice)
			navigate(paths.freePractice({ courseId: course.id }))
		else if (recommendation)
			navigate(paths.courseSkill({ courseId: course.id, skillId: recommendation }))
	}

	return (
		<Link to={paths.course({ courseId: course.id })} className={clsx(classes.tile, 'tile')}>
			<Box boxShadow={1} className="tileBox">
				<div className="nameContainer">
					<div className="name">
						{translate(course.name, `${course.id}.name`, 'edu/courses/courseInfo')}
					</div>
				</div>
				<div className="info">
					<ProgressIndicator total={skillsTotal} done={skillsDone} size={60} />
					<div>
						<Tooltip title={tooltip} arrow classes={{ tooltip: classes.tooltip }}>
							<Button variant="contained" color="info" className="directPractice" onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)} onClick={goToRecommendation}>
								<QuickPractice />
							</Button>
						</Tooltip>
					</div>
				</div>
			</Box>
		</Link>
	)
}
