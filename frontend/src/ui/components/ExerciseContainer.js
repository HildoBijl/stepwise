import React, { useState, createContext, useContext, useReducer, useEffect, useRef } from 'react'

import { emptyFunc } from 'step-wise/util/functions'

const ExerciseContext = createContext({})

export default function ExerciseContainer({ id, state, startNewExercise }) {
	// Whenever the exercise id changes, reload the component.
	const [loaded, setLoaded] = useState(false)
	const ExerciseLocal = useRef(null)
	const ExerciseShared = useRef({})
	const reload = () => {
		setLoaded(false)
		Promise.all([import(`../exercises/${id}`), import(`step-wise/edu/exercises/${id}`)]).then(importedModules => {
			const [localModule, sharedModule] = importedModules
			ExerciseLocal.current = localModule.default
			ExerciseShared.current = sharedModule.default
			setLoaded(true)
		})
	}
	useEffect(reload, [id])

	// Set up progress reducer.
	const reducer = (history, action) => {
		// Check if we got any special action types.
		if (action.type === 'clearHistory')
			return []
		
		// Update the history in the regular way.
		const progress = ExerciseShared.current.processAction({ state, action, progress: getLastProgress(history), updateSkills: emptyFunc })
		return [...history, { action, progress }]
	}
	const [history, dispatch] = useReducer(reducer, [])

	return <>
		<ExerciseContext.Provider value={{ state, history, progress: getLastProgress(history), dispatch, startNewExercise, shared: ExerciseShared.current }}>
			{loaded ? <ExerciseLocal.current /> : <p>Loading...</p>}
		</ExerciseContext.Provider>
	</>
}

export function useExerciseData() {
	return useContext(ExerciseContext)
}

function getLastProgress(history) {
	if (history.length === 0)
		return {}
	return history[history.length - 1].progress
}