import React, { useState, Suspense, useContext, useEffect } from 'react'

const ExerciseContext = React.createContext({})
export { ExerciseContext }

let Problem = () => null, Solution = () => null

export default function Exercise({ id, state, startNewExercise }) {
	// Set up the necessary states and state handlers.
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
		Problem = React.lazy(() => import(`../exercises/${id}/Problem`))
		Solution = React.lazy(() => import(`../exercises/${id}/Solution`))
		setInput({})
		setPrevInput()
		setResult()
		setGivenUp(false)
		setSubmitting(false)
	}
	useEffect(reset, [id, state])

	// Set up button handlers.
	const submit = async () => {
		if (submitting || givenUp)
			return
		setSubmitting(true)
		// ToDo: for logged-in users submit to the server.
		const { checkInput } = await import(`step-wise/edu/exercises/${id}`)
		const result = checkInput(state, input)
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

	return (
		<ExerciseContext.Provider value={{ input, prevInput, result, setInputParameter, solved, givenUp, done }}>
			<form onSubmit={(evt) => evt.preventDefault()}>
				<Suspense fallback={<p>Loading exercise...</p>}>
					<Problem state={state} />
				</Suspense>
				{
					!done ? (
						<p>
							<button onClick={submit} disabled={submitting}>Submit</button>
							<button onClick={giveUp} disabled={submitting}>Give up</button>
						</p>
					) : (
							<>
								<Suspense fallback={<p>Loading solution...</p>}>
									<Solution state={state} />
								</Suspense>
								<p><button onClick={startNewExercise}>Next problem</button></p>
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