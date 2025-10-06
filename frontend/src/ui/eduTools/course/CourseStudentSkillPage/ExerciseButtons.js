import { useEffect, useRef } from 'react'
import { Box, Typography, Button, alpha } from '@mui/material'

import { useDimension } from 'util'
import { Translation } from 'i18n'


import { getExerciseOutcome, getOutcomeColor } from '../util'

const labelWidth = 100
export function ExerciseButtons({ exerciseIndex, setExerciseIndex, skillData, showLabels, setShowLabels }) {
	// Extract the exercises.
	const exercises = skillData.exercises
	exerciseIndex = exerciseIndex ?? exercises.length - 1

	// Update whether or not labels have to be shown.
	const containerRef = useRef()
	const containerWidth = useDimension(containerRef, 'offsetWidth')
	useEffect(() => {
		if (containerWidth !== undefined)
			setShowLabels(exercises.length * 40 + 120 <= containerWidth)
	}, [setShowLabels, exercises, containerWidth])

	// Render the buttons.
	return <Box ref={containerRef} sx={{ display: 'flex', alignItems: 'center', gap: 2, my: showLabels ? 1 : 2, minHeight: '32px' }}>
		{showLabels && <Typography variant="subtitle1" sx={{ fontWeight: 500, width: labelWidth }}>
			<Translation entry="exercises">Exercises</Translation>
		</Typography>}
		<Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
			{exercises.map((exercise, index) => <ListButton
				key={index}
				active={index === exerciseIndex}
				onClick={() => setExerciseIndex(index)}
				color={getOutcomeColor(getExerciseOutcome(exercise))}
				value={index + 1} />)}
		</Box>
	</Box>
}

export function SubmissionButtons({ exerciseIndex, submissionIndex, setSubmissionIndex, skillData, showLabels }) {
	const exercises = skillData.exercises
	const exercise = exercises[exerciseIndex]
	const events = exercise.history

	const lastInputEventIndex = events.length - 1 - [...events].reverse().findIndex(event => event.action.type === 'input')
	submissionIndex = submissionIndex ?? lastInputEventIndex

	// Show the submission buttons.
	return <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: showLabels ? 1 : 2, minHeight: '32px' }}>
		{showLabels && <Typography variant="subtitle1" sx={{ fontWeight: 500, width: labelWidth }}>
			<Translation entry="submissions">Submissions</Translation>
		</Typography>}
		{events.length === 0 ? <Box>
			<Translation entry="noSubmissions">None so far</Translation>
		</Box> : <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
			{events.map((event, index) => {
				let disabled, color, value
				const progress = event.progress
				const prevProgress = events[index - 1]?.progress || {}
				switch (event.action.type) {
					case 'giveUp':
						disabled = true
						if (progress.split && !prevProgress.split) { // Split action?
							color = 'warning'
							value = 'S'
						} else { // Regular give-up action.
							color = 'warning'
							value = progress.split ? `${prevProgress.step}.G` : 'G'
						}
						break
					case 'input':
						// Determine if the input was correct.
						let correct = false
						if (progress.solved) // Main problem?
							correct = true
						if (prevProgress.split && progress[prevProgress.step].solved) // At a step?
							correct = true

						// Set up parameters.
						disabled = false
						color = correct ? 'success' : 'error'
						value = progress.split ? // Count the number of previous actions (at that step).
							`${prevProgress.step}.${events.filter((currEvent, currIndex) => currEvent.progress.step === prevProgress.step && currIndex < index).length}` :
							events.filter((_, currIndex) => currIndex <= index).length
						break
					default:
						throw new Error(`Invalid action type "${event.action.type}" encountered.`)
				}

				return <ListButton
					key={index}
					active={index === submissionIndex}
					onClick={() => setSubmissionIndex(index)}
					disabled={disabled}
					color={color}
					value={value} />
			})}
		</Box>}
	</Box>
}

function ListButton({ value, active, onClick, color = 'info', disabled = false }) {
	return <Button disabled={disabled} onClick={disabled ? undefined : onClick} sx={theme => ({
		backgroundColor: alpha(theme.palette[color].main, active ? 0.4 : 0.2),
		width: 32,
		height: 32,
		minWidth: 32,
		fontSize: 14,
		fontWeight: 500,
		whiteSpace: 'nowrap',
		color: theme.palette.text.primary,
		border: active
			? `2px solid ${theme.palette[color].main} `
			: `1px solid ${theme.palette.divider} `,
		boxShadow: active
			? `0 0 6px ${theme.palette[color].main} `
			: "none",
		'&:hover': disabled ? {} : {
			border: `2px solid ${theme.palette[color].main} `,
			boxShadow: `0 0 4px ${theme.palette[color].main} `,
			backgroundColor: alpha(theme.palette[color].main, 0.3),
		},
	})}>{value}</Button>
}
