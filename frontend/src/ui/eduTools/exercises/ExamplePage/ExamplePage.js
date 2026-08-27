import React, { useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { noop } from '@step-wise/js-utils'
import { generateRandomExerciseInstance } from '@step-wise/exercise-selection'
import { hasExamples, getExamples } from '@step-wise/exercises'

import { useGetTranslation } from 'i18n'
import { LoadingNote } from 'ui/components'

import { ExerciseContainer } from '../containers'

// The ExamplePage resembles the ExercisePageForStranger component: it selects an exercise and shows it, but then in demo mode.
export function ExamplePage({ skillId }) {
	const getTranslation = useGetTranslation()

	// Track the exercise data. Generate new data on a change in skill ID.
	const [exercise, setExercise] = useState(null)
	const startNewExercise = useCallback(() => {
		if (!hasExamples(skillId))
			throw new Error(`Invalid startNewExercise call: the skill ${skillId} has no example exercises.`)
		const newExercise = generateRandomExerciseInstance(getExamples(skillId), 'solo')
		const exercise = { // Emulate the exercise object that we otherwise get from the server.
			...newExercise,
			id: uuidv4(), // Just generate a random one.
			active: true,
			state: newExercise.initialState,
			startedAt: new Date(),
		}
		setExercise(exercise)
	}, [skillId])

	// Start a new exercise whenever the skillId changes.
	useEffect(startNewExercise, [startNewExercise, skillId])

	// On a submit handle the process as would happen on the server: find the new state and incorporate it into the exercise data and its history.
	const submitAction = useCallback((action, processSoloAction) => {
		// Determine the new state.
		let state
		if (action?.type === 'setState') // An override only used by example exercises.
			state = action.newState
		else
			state = processSoloAction({ parameters: exercise.parameters, state: exercise.state, action, updateSkills: noop })

		// Use it to adjust the exercise.
		setExercise({
			...exercise,
			active: exercise.active && !state.done,
			state,
			history: [...exercise.history, { action, state, performedAt: new Date() }],
		})
	}, [exercise, setExercise])

	// Are there simply no exercises?
	if (!hasExamples(skillId))
		return <div>{getTranslation('loadingNotes.noExamples', 'eduTools/pages/skillPage')}</div>

	// Is there no exercise loaded yet?
	if (!exercise)
		return <LoadingNote text={getTranslation('loadingNotes.generatingNewExercise', 'eduTools/pages/skillPage')} />

	// All fine! Display the exercise. Use a key to force a rerender on a new exercise.
	return <ExerciseContainer key={exercise.startedAt} skillId={skillId} exercise={exercise} submitting={false} submitAction={submitAction} startNewExercise={startNewExercise} example={true} />
}
