import React from 'react'
import { Box, Collapse, alpha } from '@mui/material'
import { ChevronRight as Arrow } from '@mui/icons-material'

import { count } from 'step-wise/util'

import { notSelectable } from 'ui/theme'
import { ProgressIndicator } from 'ui/components'

import { SkillList } from './SkillList'

export function Block({ landscape, courseCode, skillIds, active, toggleActive, name, number, isPriorKnowledge, analysis }) {
	const numCompleted = analysis ? count(skillIds, (skillId) => analysis.practiceNeeded[skillId] === 0) : 0

	return (
		<Box boxShadow={1} sx={{
			borderRadius: '0.5rem',
			marginBottom: '0.6rem',
			overflow: 'hidden',
		}}>
			<Box className="block" onClick={toggleActive} sx={theme => ({
				alignItems: 'center',
				background: alpha(theme.palette.primary.main, landscape && active ? 0.1 : 0.03),
				cursor: 'pointer',
				display: 'flex',
				flexFlow: 'row nowrap',
				justifyContent: 'flex-start',
				padding: '0.6rem',
				...notSelectable,
				'&:hover .arrow': {
					opacity: 1,
				},
			})}>
				<ProgressIndicator total={skillIds.length} done={numCompleted} sx={{ margin: '0 0.4rem 0 0' }} />
				{number === undefined ? null : <Box className="number" sx={theme => ({
					color: theme.palette.primary.main,
					flex: '0 0 auto',
					fontSize: '1.6rem',
					margin: '0.2rem 0.6rem',
				})}>{number}</Box>}
				<Box className="name" sx={{
					flex: '1 1 auto',
					fontSize: '1rem',
					margin: '0.4rem',
				}}>{name}</Box>
				<Arrow className="arrow" sx={theme => ({
					flex: '0 0 auto',
					opacity: landscape && active ? 1 : 0.4,
					transition: `transform ${theme.transitions.duration.standard}ms`,
					transform: landscape ? undefined : (active ? 'rotate(-90deg)' : 'rotate(90deg)'),
				})} />
			</Box>
			{landscape ? null : (
				<Collapse in={active}>
					<SkillList courseCode={courseCode} skillIds={skillIds} landscape={landscape} isPriorKnowledge={isPriorKnowledge} analysis={analysis} />
				</Collapse>
			)}
		</Box>
	)
}
