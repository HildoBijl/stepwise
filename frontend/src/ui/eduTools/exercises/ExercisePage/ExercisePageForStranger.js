import React, { useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { noop } from 'step-wise/util'
import { toFO, toSO } from 'step-wise/inputTypes'
import { skillTree, getNewRandomExercise } from 'step-wise/eduTools'

import { useGetTranslation } from 'i18n'
import { LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

export function ExercisePageForStranger({ skillId }) {
	const getTranslation = useGetTranslation()
	const skill = skillTree[skillId]
	const hasExercises = skill.exercises.length > 0

	// Use a state to track exercise data. Generate new data on a change in skill ID.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		async function startNewExerciseAsync() {
			const newExercise = await getNewRandomExercise(skillId)
			const exercise = { // Emulate the exercise object that we otherwise get from the server.
				exerciseId: newExercise.exerciseId,
				state: toSO(newExercise.state), // The state should be in storage format, as if it came from the database.
				id: uuidv4(), // Just generate a random one.
				active: true,
				progress: {},
				history: [],
				startedOn: new Date(),
			}
			setExercise(exercise)
		}
		if (hasExercises)
			startNewExerciseAsync()
	}, [hasExercises, skillId])

	// Start a new exercise whenever the skillId changes.
	useEffect(startNewExercise, [startNewExercise, skillId])

	// On a submit handle the process as would happen on the server: find the new progress and incorporate it into the exercise data and its history.
	const submitAction = useCallback((action, processAction) => {
		const progress = processAction({ action, state: toFO(exercise.state), progress: exercise.progress, history: exercise.history, updateSkills: noop })
		setExercise({
			...exercise,
			active: exercise.active && !progress.done,
			progress,
			history: [...exercise.history, {
				action,
				progress,
				performedAt: new Date(),
			}],
		})
	}, [exercise, setExercise])

	// Are there simply no exercises?
	if (!hasExercises)
		return <div>{getTranslation('loadingNotes.noExercises', 'eduTools/pages/skillPage')}</div>

	// Is there no exercise loaded yet?
	if (!exercise)
		return <LoadingNote text={getTranslation('loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedOn} exercise={exercise} skillId={skillId} submitting={false} submitAction={submitAction} startNewExercise={startNewExercise} />
}
