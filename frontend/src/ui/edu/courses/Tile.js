import React, { useState } from 'react'
import clsx from 'clsx'
import { Link, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'

import skills from 'step-wise/edu/skills'

import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import QuickPractice from 'ui/components/icons/QuickPractice'
import Rectangle from 'ui/components/Rectangle'
import Button from 'ui/components/Button'
import ProgressIndicator from 'ui/components/ProgressIndicator'

import { strFreePractice } from '../course/util'

const useStyles = makeStyles((theme) => ({
	tile: {
		...notSelectable,

		'& .tileBox': {
			background: fade(theme.palette.primary.main, 0.03),
			borderRadius: '0.5rem',
			cursor: 'pointer',
			overflow: 'hidden',
			...linkStyleReset,

			'& .tileInner': {
				alignItems: 'stretch',
				display: 'flex',
				flexFlow: 'column nowrap',
				padding: '0.3rem',

				'&:hover': {
					background: ({ buttonHover }) => fade(theme.palette.primary.main, buttonHover ? 0.03 : 0.1),
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
	},
	tooltip: {
		maxWidth: '12rem',
		textAlign: 'center',
	},
}))

export default function Tile({ course, skillsTotal, skillsDone, recommendation }) {
	const paths = usePaths()
	const [buttonHover, setButtonHover] = useState(false)
	const history = useHistory()
	const classes = useStyles({ buttonHover })

	// Set up recommendation tooltip.
	let tooltip
	switch (recommendation) {
		case undefined:
			tooltip = 'Je voortgang wordt nog ingeladen...'
			break
		case strFreePractice:
			tooltip = 'Je beheerst alle vaardigheden. Ga naar de vrij-oefenen-modus.'
			break
		default:
			tooltip = `Direct oefenen: ${skills[recommendation].name}`
			break
	}

	// Set up recommendation handler.
	const goToRecommendation = (evt) => {
		evt.preventDefault() // Prevent the tile link from working.
		if (recommendation === strFreePractice)
			history.push(paths.freePractice({ courseId: course.id }))
		else if (recommendation)
			history.push(paths.courseSkill({ courseId: course.id, skillId: recommendation }))
	}

	return (
		<Link to={paths.course({ courseId: course.id })} className={clsx(classes.tile, 'tile')}>
			<Box boxShadow={1} className="tileBox">
				<Rectangle aspectRatio={0.75} className="tileInner">
					<div className="nameContainer">
						<div className="name">
							{course.name}
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
				</Rectangle>
			</Box>
		</Link>
	)
}
