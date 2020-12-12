import React, { useState, createContext, useContext, useEffect, useRef } from 'react'

import { setIOtoFO } from 'step-wise/inputTypes'

import LoadingNote from 'ui/components/flow/LoadingNote'
import ErrorBoundary from 'ui/components/flow/ErrorBoundary'

const ExerciseContext = createContext({})
export { ExerciseContext } // Exported for testing purposes.

export default function ExerciseContainer({ exercise, submitting, submitAction, startNewExercise }) {
	// Whenever the exercise id changes, reload the component.
	const { exerciseId, state } = exercise
	const [loading, setLoading] = useState(true)
	const ExerciseLocal = useRef(null)
	const ExerciseShared = useRef({})
	const reload = () => {
		setLoading(true)
		Promise.all([import(`./exercises/${exerciseId}`), import(`step-wise/edu/exercises/exercises/${exerciseId}`)]).then(importedModules => {
			const [localModule, sharedModule] = importedModules
			ExerciseLocal.current = localModule.default
			ExerciseShared.current = sharedModule.default
			setLoading(false)
		})
		// ToDo later: set up error handling for when components fail to load.
	}
	useEffect(reload, [exerciseId])

	if (loading)
		return <LoadingNote text="Loading exercise component" />

	// Set up data for the exercise and put it in a context around the exercise.
	const exerciseData = {
		state: setIOtoFO(state),
		history: exercise.history,
		progress: getLastProgress(exercise.history),
		submitting,
		submitAction: (action) => submitAction(action, ExerciseShared.current.processAction), // Incorporate the processAction function for Stranger-mode and for optimistic responses.
		startNewExercise,
		shared: ExerciseShared.current,
	}

	const Exercise = ExerciseLocal.current
	return (
		<ExerciseContext.Provider value={exerciseData}>
			<ErrorBoundary text="De opgave is gecrashed.">
				<Exercise />
			</ErrorBoundary>
		</ExerciseContext.Provider>
	)
}

export function useExerciseData() {
	return useContext(ExerciseContext)
}

export function getLastProgress(history) {
	if (history.length === 0)
		return {}
	return history[history.length - 1].progress
}

export function getPrevProgress(history) {
	if (history.length <= 1)
		return {}
	return history[history.length - 2].progress
}