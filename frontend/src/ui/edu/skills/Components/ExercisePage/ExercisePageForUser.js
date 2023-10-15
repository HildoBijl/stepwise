import React, { useEffect, useCallback } from 'react'

import { skillTree } from 'step-wise/edu/skills'

import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from 'api/skill'
import { useTranslator } from 'i18n'
import { ErrorNote, LoadingNote } from 'ui/components'

import ExerciseContainer from '../../../exercises/ExerciseContainer'

import { useSkillId } from '../../util'

export function ExercisePageForUser() {
	const translate = useTranslator()

	// Load in the skill and its exercises.
	const skillId = useSkillId()
	const skill = skillTree[skillId]
	const hasExercises = skill.exercises.length > 0

	// Load the exercise the user has open.
	const { loading, error, data } = useSkillQuery(skillId)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartExerciseMutation(skillId)
	const [submitActionToServer, { loading: submissionLoading, error: submissionError }] = useSubmitExerciseActionMutation(skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises)
			startNewExerciseOnServer()
	}, [startNewExerciseOnServer, hasExercises])
	const submitAction = useCallback((action, processAction) => {
		// ToDo later: implement processAction, if it's given, to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const exercise = data && data.skill && data.skill.currentExercise
	useEffect(() => {
		if (!loading && !exercise)
			startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>{translate('Oh no ... no exercises have been added yet for this skill. We will add them as soon as we can. Please check back later!', 'loadingNotes.noExercises', 'edu/skills/skillPage')}</div>

	// Any errors we should notify the user of?
	if (error)
		return <ErrorNote error={error} />
	if (submissionError)
		return <ErrorNote error={submissionError} />
	if (newExerciseError)
		return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text={translate('Loading exercise data...', 'loadingNotes.loadingExerciseData', 'edu/skills/skillPage')} />
	if (newExerciseLoading || !exercise)
		return <LoadingNote text={translate('Generating new exercise...', 'loadingNotes.generatingNewExercise', 'edu/skills/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}
