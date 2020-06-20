import React, { useState, useContext, useReducer, useEffect, useRef } from 'react'

import { emptyFunc } from 'step-wise/util/functions'
import { useCounter } from '../../util/react'

const ExerciseContext = React.createContext({})

export default function ExerciseLoader({ id, state, startNewExercise }) {
	// Whenever the exercise id changes, reload the component.
	const [loaded, setLoaded] = useState(false)
	const Exercise = useRef(null)
	const ExerciseData = useRef({})
	const reload = () => {
		setLoaded(false)
		Promise.all([import(`../exercises/${id}`), import(`step-wise/edu/exercises/${id}`)]).then(res => {
			const [localModule, sharedModule] = res
			Exercise.current = localModule.default // Use the default export of the module.
			ExerciseData.current = sharedModule.default
			setLoaded(true)
		})
	}
	useEffect(reload, [id])

	// Set up registration for when we're done.
	const [done, setDone] = useState(false)
	const markAsDone = () => setDone(true)

	// Set up progress reducer.
	const reducer = (history, action) => {
		// Check if we got any special action types.
		if (action.type === 'clearHistory')
			return []
		
		// Update the history in the regular way.
		const progress = ExerciseData.current.processAction({ state, action, progress: getLastProgress(history), markAsDone, updateSkill: emptyFunc })
		return [...history, { action, progress }]
	}
	const [history, dispatch] = useReducer(reducer, [])

	// Whenever the exercise changes (state or id) reset all state parameters.
	const [counter, incrementCounter] = useCounter()
	const reset = () => {
		setDone(false)
		dispatch({ type: 'clearHistory' })
		incrementCounter() // Change the Exercise key to force an exercise rerender.
	}
	useEffect(reset, [id, state])

	return <>
		<ExerciseContext.Provider value={{ state, history, progress: getLastProgress(history), done, dispatch, startNewExercise }}>
			{loaded ? <Exercise.current key={counter} /> : <p>Loading...</p>}
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