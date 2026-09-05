import React, { useEffect, useCallback } from 'react'

import { hasExercises } from '@step-wise/exercises'

import { useSkill, useStartExercise, useSubmitExerciseAction } from 'api'
import { useTranslator } from 'i18n'
import { ErrorNote, LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForUser({ skillId, onNewExercise }) {
	const translate = useTranslator()

	// Load the exercise the user has open.
	const { skill, loading, error } = useSkill(skillId)

	// Get mutation functions.
	const [startExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExercise(skillId)
	const [submitExerciseAction, { loading: actionLoading, error: actionError }] = useSubmitExerciseAction(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises(skillId)) { // Only when the skill has exercises programmed.
			startExerciseOnServer()
			if (onNewExercise) onNewExercise()
		}
	}, [skillId, startExerciseOnServer, onNewExercise])
	const submitAction = useCallback((action, processSoloAction) => {
		// ToDo later: use processSoloAction to set up an optimistic response.
		submitExerciseAction(action)
	}, [submitExerciseAction])

	// If there is no exercise, start one.
	const exercise = skill?.activeExercise
	useEffect(() => {
		if (!loading && !exercise) startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Are there simply no exercises?
	if (!hasExercises(skillId)) return <div>{translate('Oh no ... no exercises have been added yet for this skill. We will add them as soon as we can. Please check back later!', 'loadingNotes.noExercises', 'eduTools/pages/skillPage')}</div>

	// Any errors we should notify the user of?
	if (error) return <ErrorNote error={error} />
	if (actionError) return <ErrorNote error={actionError} />
	if (newExerciseError) return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading) return <LoadingNote text={translate('Loading exercise data...', 'loadingNotes.loadingExerciseData', 'eduTools/pages/skillPage')} />
	if (newExerciseLoading || !exercise) return <LoadingNote text={translate('Generating new exercise...', 'loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedAt} skillId={skillId} exercise={exercise} submitting={actionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}
