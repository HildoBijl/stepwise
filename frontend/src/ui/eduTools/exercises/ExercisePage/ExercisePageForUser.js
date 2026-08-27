import React, { useEffect, useCallback } from 'react'

import { hasExercises } from '@step-wise/exercises'

import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from 'api'
import { useTranslator } from 'i18n'
import { ErrorNote, LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForUser({ skillId, onNewExercise }) {
	const translate = useTranslator()

	// Load the exercise the user has open.
	const { loading, error, data } = useSkillQuery(skillId)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExerciseMutation(skillId)
	const [submitActionToServer, { loading: actionLoading, error: actionError }] = useSubmitExerciseActionMutation(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises(skillId)) { // Only when the skill has exercises programmed.
			startNewExerciseOnServer()
			if (onNewExercise)
				onNewExercise()
		}
	}, [skillId, startNewExerciseOnServer, onNewExercise])
	const submitAction = useCallback((action, processSoloAction) => {
		// ToDo later: use processSoloAction to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const exercise = data?.skill?.activeExercise
	useEffect(() => {
		if (!loading && !exercise)
			startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>{translate('Oh no ... no exercises have been added yet for this skill. We will add them as soon as we can. Please check back later!', 'loadingNotes.noExercises', 'eduTools/pages/skillPage')}</div>

	// Any errors we should notify the user of?
	if (error)
		return <ErrorNote error={error} />
	if (actionError)
		return <ErrorNote error={actionError} />
	if (newExerciseError)
		return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text={translate('Loading exercise data...', 'loadingNotes.loadingExerciseData', 'eduTools/pages/skillPage')} />
	if (newExerciseLoading || !exercise)
		return <LoadingNote text={translate('Generating new exercise...', 'loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedAt} skillId={skillId} exercise={exercise} submitting={actionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}
