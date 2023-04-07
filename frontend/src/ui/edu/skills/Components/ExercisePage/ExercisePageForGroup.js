import React, { useEffect, useState, useCallback, useRef } from 'react'

import { skillTree } from 'step-wise/edu/skills'

import { useActiveGroup, useActiveGroupExercisesResult, useActiveGroupExerciseForSkill, useStartGroupExerciseMutation, useSubmitGroupActionMutation, useCancelGroupActionMutation, useResolveGroupEventMutation } from 'api/group'
import LoadingNote from 'ui/components/flow/LoadingNote'
import ErrorNote from 'ui/components/flow/ErrorNote'

import ExerciseContainer from '../../../exercises/ExerciseContainer'

import { useSkillId } from '../../util'

export default function ExercisePageForGroup() {
	// Load in the skill and its exercises.
	const group = useActiveGroup()
	const skillId = useSkillId()
	const skill = skillTree[skillId]
	const hasExercises = skill.exercises.length > 0
	const [requestedNextExercise, setRequestedNextExercise] = useState(false)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartGroupExerciseMutation(group.code, skillId)
	const [submitActionToServer, { error: submissionError }] = useSubmitGroupActionMutation(group.code, skillId)
	const [cancelAction, { error: cancelError }] = useCancelGroupActionMutation(group.code, skillId)
	const [resolveEvent, { loading: resolveLoading, error: resolveError }] = useResolveGroupEventMutation(group.code, skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises) {
			setRequestedNextExercise(true)
			startNewExerciseOnServer()
		}
	}, [startNewExerciseOnServer, hasExercises])
	const submitAction = useCallback((action, processAction) => {
		// ToDo later: implement processAction, if it's given, to set up an optimistic response.
		submitActionToServer({ variables: { action } })
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const { loading, error } = useActiveGroupExercisesResult()
	const exercise = useActiveGroupExerciseForSkill(skillId)
	useEffect(() => {
		if (!loading && !exercise)
			startNewExercise()
	}, [loading, exercise, startNewExercise])

	// Even when there is a new exercise, still show the previous exercise until the user requested the next exercise.
	const displayExerciseRef = useRef()
	if (exercise && (!displayExerciseRef.current || displayExerciseRef.current.id === exercise.id))
		displayExerciseRef.current = exercise
	useEffect(() => {
		if (requestedNextExercise && displayExerciseRef.current !== exercise) {
			displayExerciseRef.current = exercise
			setRequestedNextExercise(false)
		}
	}, [requestedNextExercise, displayExerciseRef, exercise])
	const displayExercise = requestedNextExercise ? exercise : displayExerciseRef.current

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>Helaas ... er zijn nog geen opgaven voor deze vaardigheid toegevoegd. Ze komen er zo snel mogelijk aan. Kom later nog eens terug!</div>

	// Any errors we should notify the user of?
	const presentError = error && newExerciseError && submissionError && cancelError && resolveError
	if (presentError)
		return <ErrorNote error={presentError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text="Loading exercise data." />
	if (newExerciseLoading)
		return <LoadingNote text="Generating new exercise." />
	if (!displayExercise)
		return <LoadingNote text="No exercise yet. Generating one." />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={displayExercise.startedOn} exercise={displayExercise} groupExercise={true} submitting={resolveLoading} submitAction={submitAction} cancelAction={cancelAction} resolveEvent={resolveEvent} startNewExercise={startNewExercise} />
}
