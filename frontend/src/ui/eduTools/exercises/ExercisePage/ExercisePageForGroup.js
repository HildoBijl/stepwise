import React, { useEffect, useCallback } from 'react'
import { Alert } from '@mui/material'

import { hasExercises } from '@step-wise/exercises'
import { useSessionStorageState } from '@step-wise/react-utils'
import { Translation, useTextTranslation } from '@step-wise/i18n'

import { useActiveGroup, useGroupExercise, useLatestGroupExercise, useStartGroupExercise, useSubmitGroupAction, useCancelGroupAction, useResolveGroupEvent } from 'api'
import { Button, ErrorNote, LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForGroup({ skillId }) {
	const noExercises = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'noExercises', source: 'Oh no ... no exercises have been added yet for this skill. We will add them as soon as we can. Please check back later!' })
	const loadingExerciseData = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'loadingExerciseData', source: 'Loading exercise data...' })
	const generatingNewExercise = useTextTranslation({ folder: ['eduTools', 'pages'], catalog: 'skillPage', group: ['loadingNotes'], id: 'generatingNewExercise', source: 'Generating new exercise...' })

	// Load the latest exercise and remember which exercise this browser tab is displaying.
	const group = useActiveGroup()
	const storageKey = `step-wise:displayed-group-exercise:${group.code}:${skillId}`
	const [displayedExerciseId, setDisplayedExerciseId] = useSessionStorageState(storageKey, undefined, { parse: value => typeof value === 'string' ? value : undefined })
	const { exercise: latestExercise, loading: latestExerciseLoading, error: latestExerciseError } = useLatestGroupExercise(group.code, skillId)
	const loadDisplayedExercise = !!displayedExerciseId && displayedExerciseId !== latestExercise?.id
	const { exercise: storedExercise, loading: storedExerciseLoading, error: storedExerciseError } = useGroupExercise(loadDisplayedExercise ? displayedExerciseId : undefined)
	const displayedExercise = loadDisplayedExercise ? storedExercise : latestExercise

	// Get mutation functions.
	const [startNewExerciseOnServer, { loading: newExerciseLoading, error: newExerciseError }] = useStartGroupExercise(group.code, skillId)
	const [submitActionToServer, { error: actionError }] = useSubmitGroupAction()
	const [cancelAction, { error: cancelError }] = useCancelGroupAction()
	const [resolveEvent, { loading: resolveLoading, error: resolveError }] = useResolveGroupEvent()

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (!hasExercises(skillId)) return
		startNewExerciseOnServer().then(setDisplayedExerciseId).catch(() => { })
	}, [setDisplayedExerciseId, skillId, startNewExerciseOnServer])
	const submitAction = useCallback(action => {
		if (!displayedExercise) return
		submitActionToServer(displayedExercise.id, displayedExercise.eventIndex, action).catch(() => { })
	}, [displayedExercise, submitActionToServer])
	const cancelCurrentAction = useCallback(() => {
		if (!displayedExercise) return
		return cancelAction(displayedExercise.id, displayedExercise.eventIndex)
	}, [cancelAction, displayedExercise])
	const resolveCurrentEvent = useCallback(() => {
		if (!displayedExercise) return
		return resolveEvent(displayedExercise.id, displayedExercise.eventIndex)
	}, [displayedExercise, resolveEvent])

	// Initially display the latest exercise. If none exists yet, start one.
	useEffect(() => {
		if (!displayedExerciseId && latestExercise) setDisplayedExerciseId(latestExercise.id)
		else if (!latestExerciseLoading && !latestExercise && !newExerciseLoading) startNewExercise()
	}, [displayedExerciseId, latestExercise, latestExerciseLoading, newExerciseLoading, setDisplayedExerciseId, startNewExercise])

	// Recover from an obsolete stored ID by falling back to the latest available exercise.
	useEffect(() => {
		if (loadDisplayedExercise && !storedExerciseLoading && !storedExercise && latestExercise)
			setDisplayedExerciseId(latestExercise.id)
	}, [latestExercise, loadDisplayedExercise, setDisplayedExerciseId, storedExercise, storedExerciseLoading])

	// Are there simply no exercises?
	if (!hasExercises(skillId))
		return <div>{noExercises}</div>

	// Any errors we should notify the user of?
	const presentError = latestExerciseError || storedExerciseError || newExerciseError || actionError || cancelError || resolveError
	if (presentError)
		return <ErrorNote error={presentError} />

	// Anything still loading?
	if (latestExerciseLoading || storedExerciseLoading)
		return <LoadingNote text={loadingExerciseData} />
	if (newExerciseLoading || !displayedExercise)
		return <LoadingNote text={generatingNewExercise} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	const newerExerciseAvailable = !!latestExercise && latestExercise.id !== displayedExercise.id
	return <>
		{newerExerciseAvailable && <Alert
			severity={'warning'}
			action={<Button color={'inherit'} size={'small'} onClick={() => setDisplayedExerciseId(latestExercise.id)}>
				<Translation folder={['eduTools']} catalog="exercises" group={['groupExercise', 'buttons']} id="newGroupExercise">Open latest exercise</Translation>
			</Button>}
			sx={{ marginBottom: 2 }}
		>
			<Translation folder={['eduTools']} catalog="exercises" group={['groupExercise', 'status']} id="newGroupExercise">Another group member has started a newer exercise.</Translation>
		</Alert>}
		<ExerciseContainer key={displayedExercise.startedAt} skillId={skillId} exercise={displayedExercise} groupExercise={true} submitting={resolveLoading} submitAction={submitAction} cancelAction={cancelCurrentAction} resolveEvent={resolveCurrentEvent} startNewExercise={startNewExercise} />
	</>
}
