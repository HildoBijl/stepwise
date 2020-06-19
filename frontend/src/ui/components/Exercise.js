import React, { useState, useContext, useEffect } from 'react'

import { IOtoFO } from 'step-wise/edu/inputTransformation'

const ExerciseContext = React.createContext({})

let components

export default function Exercise({ id, state, startNewExercise }) {
	// Set up the necessary states and state handlers.
	const [componentsLoaded, setComponentsLoaded] = useState(false)
	const [input, setInput] = useState({ ans: '' })
	const [prevInput, setPrevInput] = useState(null)
	const [result, setResult] = useState(null)
	const [givenUp, setGivenUp] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const setInputParameter = (parameter, value) => {
		setInput({ ...input, [parameter]: value })
	}

	// Reset when the exercise changes.
	const reset = () => {
		setComponentsLoaded(false)
		setInput({})
		setPrevInput()
		setResult()
		setGivenUp(false)
		setSubmitting(false)
		import(`../exercises/${id}`).then((loadedComponents) => {
			components = loadedComponents
			setComponentsLoaded(true)
		})
	}
	useEffect(reset, [id, state])

	// Set up button handlers.
	const submit = async () => {
		if (submitting || givenUp)
			return
		setSubmitting(true)
		// ToDo: for logged-in users submit to the server.
		const { checkInput } = await import(`step-wise/edu/exercises/${id}`)
		const result = checkInput(state, IOtoFO(input))
		setSubmitting(false)
		setPrevInput(input)
		setResult(result)
	}
	const giveUp = () => {
		if (submitting)
			return
		// ToDo: ask for confirmation.
		// ToDo: for logged-in users submit to the server.
		setGivenUp(true)
	}

	// Note the current status of the exercise.
	const solved = result === true || (result && result.done === true)
	const done = solved || givenUp

	// Show loader when loading components.
	if (!componentsLoaded)
		return <p>Loading exercise...</p>

	return (
		<ExerciseContext.Provider value={{ state, input, prevInput, result, solved, givenUp, done, setInputParameter }}>
			<form onSubmit={(evt) => evt.preventDefault()}>
				<components.Problem state={state} />
				{
					!done ? (
						<p>
							<button type="button" onClick={submit} disabled={submitting}>Submit</button>
							<button type="button" onClick={giveUp} disabled={submitting}>Give up</button>
						</p>
					) : (
							<>
								<components.Solution state={state} />
								<p><button type="button" onClick={startNewExercise}>Next problem</button></p>
							</>
						)
				}
			</form>
		</ExerciseContext.Provider>
	)
}

export function InputSpace({ children }) {
	const { input, prevInput } = useContext(ExerciseContext)
	if (!input && !prevInput)
		return null
	return <>{children}</>
}

export function AntiInputSpace({ children }) {
	const { input, prevInput } = useContext(ExerciseContext)
	if (input || prevInput)
		return null
	return <>{children}</>
}

export function useExerciseData() {
	return useContext(ExerciseContext)
}