import { useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { getCourseOverview } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Info, LoadingIndicator, ErrorNote } from 'ui/components'

import { useSkillId } from '../../skills'
import { processStudent } from '../../courses'

import { useCourseData } from '../components'

import { ExerciseButtons, SubmissionButtons } from './ExerciseButtons'
import { SubmissionDate } from './SubmissionDate'
import { CurrentExercise } from './CurrentExercise'

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
			<ExerciseButtons {...{ exerciseIndex, setExerciseIndex, skillData, showLabels, setShowLabels }} />
			<SubmissionButtons {...{ exerciseIndex, submissionIndex, setSubmissionIndex, skillData, showLabels }} />
		</TranslationSection>
		<SubmissionDate {...{ exercise, submissionIndex, events, event }} />
		<CurrentExercise {...{ exerciseIndex, submissionIndex, course, student, skillData }} />
	</TranslationFile>
}
