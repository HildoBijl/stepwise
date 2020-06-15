import React, { useState, Suspense, useEffect } from 'react'

export default function Exercise({ id, state, startNewExercise }) {
	const Problem = React.lazy(() => import(`../exercises/${id}/Problem`))
	const Solution = React.lazy(() => import(`../exercises/${id}/Solution`))

	// Set up the necessary states.
	const [input, setInput] = useState({ ans: '' })
	const [prevInput, setPrevInput] = useState()
	const [result, setResult] = useState()
	const [checking, setChecking] = useState(false)

	// Reset when the exercise changes.
	const reset = () => {
		setInput({ ans: '' })
		setPrevInput()
		setResult()
		setChecking(false)
	}
	useEffect(() => reset, [id, state])

	// Handle submissions.
	const handleSubmit = async evt => {
		evt.preventDefault()
		setChecking(true)
		const { checkInput } = await import(`step-wise/edu/exercises/${id}`)
		const result = checkInput(state, input)
		setChecking(false)
		setPrevInput(input)
		setResult(result)
	}

	const done = result

	return <>
		<Suspense fallback={<p>Loading exercise...</p>}>
			<h3>Problem</h3>
			<Problem state={state} />
			<h3>Input space</h3>
			<form onSubmit={handleSubmit}>
				<label>
					ans = <input type="text" value={input.ans} onChange={evt => setInput({ ans: evt.target.value })} />
				</label>
				{!done ? <input type="submit" value="Submit" /> : null}
				{/* {status === 'started' ? <button onClick={split}>Split</button> : null}
				{status === 'split' ? <button onClick={giveUp}>Give up</button> : null} */}
			</form>
			{checking ? <p>Checking...</p> : null}
			<p>Result: {JSON.stringify(result)}</p>
			<p>On input: {JSON.stringify(prevInput)}</p>
		</Suspense>
		{done ? (
			<>
				{/* {status === 'solved' || status === 'splitSolved' ? <p>Well done! You solved it.</p> : null}
				{status === 'givenUp' ? <p>Oh no ... hope you get the next one!</p> : null} */}
				<Suspense fallback={<p>Loading solution...</p>}>
					<h3>Solution</h3>
					<Solution state={state} />
				</Suspense>
				<p><button onClick={startNewExercise}>Next problem</button></p>
			</>
		) : null}
	</>
}


