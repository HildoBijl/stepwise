import React, { useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'

import skills from 'step-wise/edu/skills'

import { notSelectable, linkStyleReset } from 'ui/theme'
import { usePaths } from 'ui/routing'
import QuickPractice from 'ui/components/QuickPractice'
import Rectangle from 'ui/components/Rectangle'
import Button from 'ui/components/Button'

import ProgressIndicator from '../ProgressIndicator'

const useStyles = makeStyles((theme) => ({
	tile: {
		...linkStyleReset,
		...notSelectable,

		'& .tileBox': {
			background: fade(theme.palette.primary.main, 0.03),
			borderRadius: '0.5rem',
			cursor: 'pointer',
			overflow: 'hidden',

			'& .tileInner': {
				alignItems: 'stretch',
				display: 'flex',
				flexFlow: 'column nowrap',
				padding: '0.3rem',

				'&:hover': {
					background: ({ buttonHover }) => fade(theme.palette.primary.main, buttonHover ? 0.03 : 0.1),
				},

				'& .titleContainer': {
					alignItems: 'center',
					display: 'flex',
					flexFlow: 'row nowrap',
					height: '35%',

					'& .title': {
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

export default function Tile({ course, skillsTotal, skillsLeft, recommendation }) {
	const paths = usePaths()
	const skillsDone = skillsTotal - skillsLeft
	const [buttonHover, setButtonHover] = useState(false)
	const classes = useStyles({ buttonHover })
	return (
		<Link to={paths.course({ courseId: course.name })} className={clsx(classes.tile, 'tile')}>
			<Box boxShadow={1} className="tileBox">
				<Rectangle aspectRatio={0.75} className="tileInner">
					<div className="titleContainer">
						<div className="title">
							{course.title}
						</div>
					</div>
					<div className="info">
						<ProgressIndicator total={skillsTotal} done={skillsDone} size={60} />
						<div>
							<Tooltip title={`Direct oefenen: ${skills[recommendation].name}`} arrow classes={{ tooltip: classes.tooltip }}>
								<Button variant="contained" color="info" className="directPractice" onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)}><QuickPractice /></Button>
							</Tooltip>
						</div>
					</div>
				</Rectangle>
			</Box>
		</Link>
	)
}
