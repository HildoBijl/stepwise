import React, { useEffect, useCallback } from 'react'
import { Alert } from '@mui/material'

import { hasExercises } from '@step-wise/exercises'
import { useSessionStorageState } from '@step-wise/react-utils'

import { useActiveGroup, useGroupExercise, useLatestGroupExercise, useStartGroupExercise, useSubmitGroupAction, useCancelGroupAction, useResolveGroupEvent } from 'api'
import { useGetTranslation, useTranslator } from 'i18n'
import { Button, ErrorNote, LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForGroup({ skillId }) {
	const getTranslation = useGetTranslation()
	const translate = useTranslator('eduTools/exercises')

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
	const [submitActionToServer, { error: actionError }] = useSubmitGroupAction(group.code, skillId)
	const [cancelAction, { error: cancelError }] = useCancelGroupAction(group.code, skillId)
	const [resolveEvent, { loading: resolveLoading, error: resolveError }] = useResolveGroupEvent(group.code, skillId)

	// Set up callbacks for the exercise component.
	const startNewExercise = useCallback(() => {
		if (!hasExercises(skillId)) return
		startNewExerciseOnServer().then(setDisplayedExerciseId).catch(() => { })
	}, [setDisplayedExerciseId, skillId, startNewExerciseOnServer])
	const submitAction = useCallback((action, processGroupActions) => {
		// ToDo later: use processGroupActions to set up an optimistic response.
		submitActionToServer(action).catch(() => { })
	}, [submitActionToServer])

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
		return <div>{getTranslation('loadingNotes.noExercises', 'eduTools/pages/skillPage')}</div>

	// Any errors we should notify the user of?
	const presentError = latestExerciseError || storedExerciseError || newExerciseError || actionError || cancelError || resolveError
	if (presentError)
		return <ErrorNote error={presentError} />

	// Anything still loading?
	if (latestExerciseLoading || storedExerciseLoading)
		return <LoadingNote text={getTranslation('loadingNotes.loadingExerciseData', 'eduTools/pages/skillPage')} />
	if (newExerciseLoading || !displayedExercise)
		return <LoadingNote text={getTranslation('loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	const newerExerciseAvailable = !!latestExercise && latestExercise.id !== displayedExercise.id
	return <>
		{newerExerciseAvailable && <Alert
			severity={'warning'}
			action={<Button color={'inherit'} size={'small'} onClick={() => setDisplayedExerciseId(latestExercise.id)}>
				{translate('Open latest exercise', 'groupExercise.buttons.newGroupExercise')}
			</Button>}
			sx={{ marginBottom: 2 }}
		>
			{translate('Another group member has started a newer exercise.', 'groupExercise.status.newGroupExercise')}
		</Alert>}
		<ExerciseContainer key={displayedExercise.startedAt} skillId={skillId} exercise={displayedExercise} groupExercise={true} submitting={resolveLoading} submitAction={submitAction} cancelAction={cancelAction} resolveEvent={resolveEvent} startNewExercise={startNewExercise} />
	</>
}
