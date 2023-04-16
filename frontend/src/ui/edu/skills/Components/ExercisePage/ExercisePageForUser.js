import React, { useEffect, useCallback } from 'react'

import { skillTree } from 'step-wise/edu/skills'

import { useSkillQuery, useStartExerciseMutation, useSubmitExerciseActionMutation } from 'api/skill'
import { ErrorNote, LoadingNote } from 'ui/components'

import ExerciseContainer from '../../../exercises/ExerciseContainer'

import { useSkillId } from '../../util'

export default function ExercisePageForUser() {
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
		return <div>Helaas ... er zijn nog geen opgaven voor deze vaardigheid toegevoegd. Ze komen er zo snel mogelijk aan. Kom later nog eens terug!</div>

	// Any errors we should notify the user of?
	if (error)
		return <ErrorNote error={error} />
	if (submissionError)
		return <ErrorNote error={submissionError} />
	if (newExerciseError)
		return <ErrorNote error={newExerciseError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text="Loading exercise data." />
	if (newExerciseLoading)
		return <LoadingNote text="Generating new exercise." />
	if (!exercise)
		return <LoadingNote text="No exercise yet. Generating one." />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} submitting={submissionLoading} submitAction={submitAction} startNewExercise={startNewExercise} />
}
