import React, { useEffect, useState, useCallback, useRef } from 'react'

import { hasExercises } from '@step-wise/exercises'

import { useActiveGroup, useLatestGroupExercise, useStartGroupExercise, useSubmitGroupAction, useCancelGroupAction, useResolveGroupEvent } from 'api'
import { useGetTranslation } from 'i18n'
import { ErrorNote, LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForGroup({ skillId }) {
	const getTranslation = useGetTranslation()

	// Load in the skill and its exercises.
	const group = useActiveGroup()
	const [requestedNextExercise, setRequestedNextExercise] = useState(false)

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartGroupExercise(group.code, skillId)
	const [submitActionToServer, { error: actionError }] = useSubmitGroupAction(group.code, skillId)
	const [cancelAction, { error: cancelError }] = useCancelGroupAction(group.code, skillId)
	const [resolveEvent, { loading: resolveLoading, error: resolveError }] = useResolveGroupEvent(group.code, skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (hasExercises(skillId)) {
			setRequestedNextExercise(true)
			startNewExerciseOnServer().catch(() => {})
		}
	}, [skillId, startNewExerciseOnServer])
	const submitAction = useCallback((action, processGroupActions) => {
		// ToDo later: use processGroupActions to set up an optimistic response.
		submitActionToServer(action).catch(() => {})
	}, [submitActionToServer])

	// If there is no exercise, start one.
	const { exercise, loading, error } = useLatestGroupExercise(group.code, skillId)
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
	if (!hasExercises(skillId))
		return <div>{getTranslation('loadingNotes.noExercises', 'eduTools/pages/skillPage')}</div>

	// Any errors we should notify the user of?
	const presentError = error || newExerciseError || actionError || cancelError || resolveError
	if (presentError)
		return <ErrorNote error={presentError} />

	// Anything still loading?
	if (loading)
		return <LoadingNote text={getTranslation('loadingNotes.loadingExerciseData', 'eduTools/pages/skillPage')} />
	if (newExerciseLoading || !displayExercise)
		return <LoadingNote text={getTranslation('loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={displayExercise.startedAt} skillId={skillId} exercise={displayExercise} groupExercise={true} submitting={resolveLoading} submitAction={submitAction} cancelAction={cancelAction} resolveEvent={resolveEvent} startNewExercise={startNewExercise} />
}
