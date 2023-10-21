import React, { useState, createContext, useContext, useEffect, useRef, useMemo } from 'react'

import { toFO } from 'step-wise/inputTypes'
import { getLastProgress } from 'step-wise/edu/exercises/util/simpleExercise'

import { useConsistentValue } from 'util/react'
import { useTranslator } from 'i18n'
import { LoadingNote, ErrorBoundary } from 'ui/components/flow'

const ExerciseContext = createContext({})
export { ExerciseContext } // Exported for testing purposes.

export default function ExerciseContainer({ exercise, groupExercise, submitting, submitAction, cancelAction, resolveEvent, startNewExercise }) {
	const translate = useTranslator()
	const { exerciseId, state } = exercise
	const [loading, setLoading] = useState(true)
	const ExerciseLocal = useRef(null)
	const ExerciseShared = useRef({})

	// Whenever the exercise ID changes, reload the component.
	const reload = () => {
		setLoading(true)
		Promise.all([
			import(/* webpackChunkName: "front-end-exercises-6" */ `./exercises/${exerciseId}`),
			import(/* webpackChunkName: "shared-exercises-6" */ `step-wise/edu/exercises/exercises/${exerciseId}`),
		]).then(importedModules => {
			const [localModule, sharedModule] = importedModules
			ExerciseLocal.current = localModule.default
			ExerciseShared.current = sharedModule.default
			setLoading(false)
		}).catch((error) => {
			console.error('Exercise failed to load.')
			console.error(error) // ToDo later: properly process errors.
			throw error
		})
	}
	useEffect(reload, [setLoading, exerciseId])

	// Assemble the state as Functional Object.
	const stateFO = useMemo(() => toFO(state), [state])

	// Ensure that the progress has a consistent reference.
	const progress = useConsistentValue(getLastProgress(exercise.history))

	if (loading)
		return <LoadingNote text={translate('Loading exercise component...', 'loadingNotes.loadingExerciseComponent', 'edu/skills/skillPage')} />

	// Set up data for the exercise and put it in a context around the exercise.
	const exerciseData = {
		exerciseId,
		state: stateFO,
		groupExercise,
		history: exercise.history,
		progress,
		submitting,
		submitAction: (action) => submitAction(action, ExerciseShared.current.processAction), // Incorporate the processAction function for Stranger-mode and for optimistic responses.
		cancelAction,
		resolveEvent,
		startNewExercise,
		shared: ExerciseShared.current,
	}

	const Exercise = ExerciseLocal.current
	return (
		<ExerciseContext.Provider value={exerciseData}>
			<ErrorBoundary text={translate('Oops ... the exercise crashed.', 'loadingNotes.exerciseCrashed', 'edu/skills/skillPage')}>
				<Exercise />
			</ErrorBoundary>
		</ExerciseContext.Provider>
	)
}

export function useExerciseData() {
	return useContext(ExerciseContext)
}
