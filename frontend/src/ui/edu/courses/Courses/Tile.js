import React, { useState } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Box from '@material-ui/core/Box'
import Tooltip from '@material-ui/core/Tooltip'
import { Create as Pencil } from '@material-ui/icons'

import skills from 'step-wise/edu/skills'

import { notSelectable } from 'ui/theme'
import Rectangle from 'ui/components/Rectangle'
import Button from 'ui/components/Button'

import ProgressIndicator from '../ProgressIndicator'

const useStyles = makeStyles((theme) => ({
	tile: {
		alignItems: 'stretch',
		background: fade(theme.palette.primary.main, 0.03),
		borderRadius: '0.5rem',
		cursor: 'pointer',
		display: 'flex',
		flexFlow: 'column nowrap',
		overflow: 'hidden',
		padding: '0.3rem',
		...notSelectable,

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
				height: '3rem',
				minWidth: 0,
				padding: 0,
				width: '3rem',
			},
		},
	},
	tooltip: {
		maxWidth: '12rem',
		textAlign: 'center',
	},
}))

export default function Tile({ course, skillsTotal, skillsLeft, recommendation }) {
	const skillsDone = skillsTotal - skillsLeft
	const [buttonHover, setButtonHover] = useState(false)
	const classes = useStyles({ buttonHover })
	return (
		<Box boxShadow={1} className={clsx(classes.tile, 'tile')}>
			<Rectangle aspectRatio={0.75}>
				<div className="titleContainer">
					<div className="title">
						{course.title}
					</div>
				</div>
				<div className="info">
					<ProgressIndicator total={skillsTotal} done={skillsDone} size={60} />
					<div>
						<Tooltip title={`Direct oefenen: ${skills[recommendation].name}`} arrow classes={{ tooltip: classes.tooltip }}>
							<Button variant="contained" color="info" className="directPractice" onMouseEnter={() => setButtonHover(true)} onMouseLeave={() => setButtonHover(false)}><Pencil /></Button>
						</Tooltip>
					</div>
				</div>
			</Rectangle>
		</Box>)
}
