import React, { useEffect, useCallback } from 'react'

import { skillTree, fixExerciseIdForExercise } from 'step-wise/eduTools'

import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from 'api/skill'
import { useTranslator } from 'i18n'
import { ErrorNote, LoadingNote } from 'ui/components'


import { ExerciseContainer } from '../containers'

export function ExercisePageForUser({ skillId, onNewExercise }) {
	const translate = useTranslator()

	// Load in the skill and its exercises.
	const skill = skillTree[skillId]
	const hasExercises = Array.isArray(skill.exercises) && skill.exercises.length > 0

	// Load the exercise the user has open.
	const { loading, error, data } = useSkillQuery(skillId)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExerciseMutation(skillId)
	const [submitActionToServer, { loading: submissionLoading, error: submissionError }] = useSubmitExerciseActionMutation(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises) {
			startNewExerciseOnServer()
			if (onNewExercise)
				onNewExercise()
		}
	}, [startNewExerciseOnServer, hasExercises, onNewExercise])
	const submitAction = useCallback((action, processAction) => {
		// ToDo later: implement processAction, if it's given, to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const exercise = fixExerciseIdForExercise(data && data.skill && data.skill.currentExercise, skillId)
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
	if (submissionError)
		return <ErrorNote error={submissionError} />
	if (newExerciseError)
		return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text={translate('Loading exercise data...', 'loadingNotes.loadingExerciseData', 'eduTools/pages/skillPage')} />
	if (newExerciseLoading || !exercise)
		return <LoadingNote text={translate('Generating new exercise...', 'loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}
