import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Button, alpha } from '@mui/material'

import { lastOf } from 'step-wise/util'
import { getCourseOverview } from 'step-wise/eduTools'

import { useDimension } from 'util'
import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Par, Info, LoadingIndicator, ErrorNote, TimeAgo } from 'ui/components'

import { useSkillId } from '../../skills'
import { processStudent } from '../../courses'

import { getExerciseOutcome, getOutcomeColor } from '../util'
import { useCourseData } from '../components'

const translationPath = `eduTools/pages/courseStudentSkillPage`

export function CourseStudentSkillPage() {
	// Load in required data.
	const { studentId } = useParams()
	const { course, loading: courseLoading, error: courseError } = useCourseData()
	const { data, loading: userLoading, error: userError } = useUserQuery(studentId)

	// Check if the data is already present.
	if (userLoading || courseLoading)
		return <LoadingIndicator />
	if (userError || courseError)
		return <ErrorNote error={userError} />
	return <CourseStudentSkillPageForUser course={course} user={data.user} />
}

export function CourseStudentSkillPageForUser({ course, user }) {
	// Load in relevant data.
	const skillId = useSkillId()
	const overview = useMemo(() => getCourseOverview(course), [course])
	const student = useMemo(() => processStudent(user, overview), [user, overview])
	const skillData = student.skillsData[skillId]

	// Set up controllers for the buttons.
	let [exerciseIndex, setExerciseIndexRaw] = useState()
	let [submissionIndex, setSubmissionIndex] = useState()
	const setExerciseIndex = useCallback(exerciseIndex => {
		setSubmissionIndex()
		setExerciseIndexRaw(exerciseIndex)
	}, [setExerciseIndexRaw, setSubmissionIndex])
	const [showLabels, setShowLabels] = useState(false)

	// If there are no exercises, show this.
	if (skillData.exercises.length === 0)
		return <Info><Translation path={translationPath} entry="noExercises">The student has not opened this skill yet. There are no exercises to show.</Translation></Info>

	// Process the data based on the indices.
	const exercises = skillData.exercises
	exerciseIndex = exerciseIndex ?? exercises.length - 1
	const exercise = exercises[exerciseIndex]
	const events = exercise.history
	const lastInputEventIndex = events.length - 1 - [...events].reverse().findIndex(event => event.action.type === 'input')
	submissionIndex = submissionIndex ?? lastInputEventIndex
	const event = submissionIndex !== undefined ? events[submissionIndex] : undefined

	// Render the parts of the page.
	return <TranslationFile path={translationPath}>
		<TranslationSection entry="buttons">
			<ExerciseButtons {...{ exerciseIndex, setExerciseIndex, course, student, skillData, showLabels, setShowLabels }} />
			<SubmissionButtons {...{ exerciseIndex, submissionIndex, setSubmissionIndex, course, student, skillData, showLabels }} />
		</TranslationSection>
		<SubmissionDate {...{ exercise, submissionIndex, events, event }} />
		<CurrentExercise {...{ exerciseIndex, submissionIndex, course, student, skillData }} />
	</TranslationFile>
}

const labelWidth = 100
function ExerciseButtons({ exerciseIndex, setExerciseIndex, skillData, showLabels, setShowLabels }) {
	// Extract the exercises.
	const exercises = skillData.exercises
	exerciseIndex = exerciseIndex ?? exercises.length - 1

	// Update whether or not labels have to be shown.
	const containerRef = useRef()
	const containerWidth = useDimension(containerRef, 'offsetWidth')
	useEffect(() => {
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

function SubmissionButtons({ exerciseIndex, submissionIndex, setSubmissionIndex, course, student, skillData, showLabels }) {
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
							color = 'info'
							value = 'S'
						} else { // Regular give-up action.
							color = 'error'
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

function SubmissionDate({ exercise, submissionIndex, events, event }) {
	// Determine the previous input event.
	const earlierInputEvents = events.filter((event, index) => index < submissionIndex && event.action.type === 'input')
	const previousInputEvent = lastOf(earlierInputEvents)

	// Determine some important dates.
	const exerciseStartDate = new Date(exercise.startedOn)
	const inputDate = event && new Date(event.performedAt)
	const previousInputDate = previousInputEvent && new Date(previousInputEvent.performedAt)

	// Depending on the situation, determine the right message to show.
	let message
	if (!event)
		message = <Translation entry="exerciseStart">Exercise started <strong><TimeAgo date={exerciseStartDate} displaySeconds={true} addAgo={true} /></strong>.</Translation>
	else if (previousInputEvent)
		message = <Translation entry="timeAfterPreviousInput">Exercise started <strong><TimeAgo date={exerciseStartDate} displaySeconds={true} addAgo={true} /></strong>. Submission made <strong><TimeAgo ms={inputDate - previousInputDate} displaySeconds={true} /></strong> after the previous submission.</Translation>
	else
		message = <Translation entry="timeAfterExerciseStart">Exercise started <strong><TimeAgo date={exerciseStartDate} displaySeconds={true} addAgo={true} /></strong>. Submission made <strong><TimeAgo ms={inputDate - exerciseStartDate} displaySeconds={true} /></strong> after starting the exercise.</Translation>

	// Render the message.
	return <TranslationSection entry="submissionDate">
		<Par sx={{ fontSize: 12, fontWeight: 400 }}>{message}</Par>
	</TranslationSection>
}

function CurrentExercise() {
	// ToDo: Display current exercise. (And put this in a different file.)
	return <Par>The current exercise will be shown here... (Work in progress.)</Par>
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
