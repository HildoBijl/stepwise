import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import Collapse from '@material-ui/core/Collapse'
import Box from '@material-ui/core/Box'
import { ChevronRight as Arrow } from '@material-ui/icons'

import { notSelectable } from 'ui/theme'

import { isPracticeNeeded } from '../../skills/util'
import { useSkillsData } from '../../skills/SkillCacher'

import ProgressIndicator from '../ProgressIndicator'

import SkillList from './SkillList'

const useStyles = makeStyles((theme) => ({
	blockBox: {
		borderRadius: '0.5rem',
		marginBottom: '0.6rem',
		overflow: 'hidden',

		'& .block': {
			alignItems: 'center',
			background: fade(theme.palette.primary.main, 0.05),
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

			'& .title': {
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

export default function Block({ landscape, priorKnowledge = false, skillIds, active, toggleActive, title, number }) {
	const classes = useStyles({ landscape, active })
	const skillsData = useSkillsData(skillIds)
	const numCompleted = skillIds.reduce((sum, skillId) => skillsData[skillId] && isPracticeNeeded(skillsData[skillId], priorKnowledge) === 0 ? sum + 1 : sum, 0)

	return (
		<Box boxShadow={1} className={clsx(classes.blockBox, 'blockBox', { active, landscape, portrait: !landscape })}>
			<div className="block" onClick={toggleActive}>
				<ProgressIndicator value={numCompleted} total={skillIds.length} />
				{number === undefined ? null : <div className="number">{number}</div>}
				<div className="title">{title}</div>
				<Arrow className="arrow" />
			</div>
			{landscape ? null : (
				<Collapse in={active}>
					<SkillList skillIds={skillIds} landscape={landscape} />
				</Collapse>
			)}
		</Box>
	)
}