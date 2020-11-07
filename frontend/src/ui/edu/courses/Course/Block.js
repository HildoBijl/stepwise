import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Collapse from '@material-ui/core/Collapse'
import Box from '@material-ui/core/Box'
import { ChevronRight as Arrow } from '@material-ui/icons'

import { count } from 'step-wise/util/arrays'

import { notSelectable } from 'ui/theme'

import ProgressIndicator from '../ProgressIndicator'

import SkillList from './SkillList'

const useStyles = makeStyles((theme) => ({
	blockBox: {
		borderRadius: '0.5rem',
		marginBottom: '0.6rem',
		overflow: 'hidden',

		'& .block': {
			alignItems: 'center',
			background: fade(theme.palette.primary.main, 0.03),
			cursor: 'pointer',
			display: 'flex',
			flexFlow: 'row nowrap',
			justifyContent: 'flex-start',
			padding: '0.6rem',
			...notSelectable,

			'& .progressIndicator': {
				margin: '0 0.4rem 0 0',
			},

			'& .number': {
				color: theme.palette.primary.main,
				flex: '0 0 auto',
				fontSize: '1.6rem',
				margin: '0.2rem 0.6rem',
			},

			'& .name': {
				flex: '1 1 auto',
				fontSize: '1rem',
				margin: '0.4rem',
			},

			'& .arrow': {
				flex: '0 0 auto',
				opacity: 0.4,
				transition: `transform ${theme.transitions.duration.standard}ms`,
			},

			'&:hover .arrow': {
				opacity: 1,
			},
		},

		'&.landscape': {
			'&.active .block, & .block:hover': {
				background: fade(theme.palette.primary.main, 0.1),
			},
			'&.active': {
				'& .arrow': {
					opacity: 1,
				},
			},
		},
		'&.portrait': {
			'& .arrow': {
				transform: 'rotate(90deg)',
			},

			'&.active': {
				'& .arrow': {
					transform: 'rotate(-90deg)',
				},
			},
		},
	},
}))

export default function Block({ landscape, courseId, skillIds, active, toggleActive, name, number, isPriorKnowledge, analysis }) {
	const classes = useStyles({ landscape, active })
	const numCompleted = count(skillIds, (skillId) => analysis.practiceNeeded[skillId] === 0)

	return (
		<Box boxShadow={1} className={clsx(classes.blockBox, 'blockBox', { active, landscape, portrait: !landscape })}>
			<div className="block" onClick={toggleActive}>
				<ProgressIndicator total={skillIds.length} done={numCompleted} />
				{number === undefined ? null : <div className="number">{number}</div>}
				<div className="name">{name}</div>
				<Arrow className="arrow" />
			</div>
			{landscape ? null : (
				<Collapse in={active}>
					<SkillList courseId={courseId} skillIds={skillIds} landscape={landscape} isPriorKnowledge={isPriorKnowledge} analysis={analysis} />
				</Collapse>
			)}
		</Box>
	)
}