import React, { useEffect, useCallback } from 'react'

import { hasExercises } from '@step-wise/exercises'
import { useTextTranslation } from '@step-wise/i18n'

import { useSkill, useStartExercise, useSubmitExerciseAction } from 'api'
import { ErrorNote, LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForUser({ skillId, onNewExercise }) {
	const noExercises = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'noExercises', source: 'Oh no ... no exercises have been added yet for this skill. We will add them as soon as we can. Please check back later!' })
	const loadingExerciseData = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'loadingExerciseData', source: 'Loading exercise data...' })
	const generatingNewExercise = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'generatingNewExercise', source: 'Generating new exercise...' })

	// Load the exercise the user has open.
	const { skill, loading, error } = useSkill(skillId)

	// Get mutation functions.
	const [startExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExercise(skillId)
	const [submitExerciseAction, { loading: actionLoading, error: actionError }] = useSubmitExerciseAction()

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises(skillId)) { // Only when the skill has exercises programmed.
			startExerciseOnServer()
			if (onNewExercise) onNewExercise()
		}
	}, [skillId, startExerciseOnServer, onNewExercise])
	const submitAction = useCallback(action => {
		if (!skill?.latestExercise) return
		submitExerciseAction(skill.latestExercise.id, skill.latestExercise.eventIndex, action)
	}, [skill, submitExerciseAction])

	// If there is no exercise, start one.
	const exercise = skill?.latestExercise
	useEffect(() => {
		if (!loading && !exercise) startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Are there simply no exercises?
	if (!hasExercises(skillId)) return <div>{noExercises}</div>

	// Any errors we should notify the user of?
	if (error) return <ErrorNote error={error} />
	if (actionError) return <ErrorNote error={actionError} />
	if (newExerciseError) return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading) return <LoadingNote text={loadingExerciseData} />
	if (newExerciseLoading || !exercise) return <LoadingNote text={generatingNewExercise} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedAt} skillId={skillId} exercise={exercise} submitting={actionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}
