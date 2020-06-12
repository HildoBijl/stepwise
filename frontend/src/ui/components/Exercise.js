import React, { useState, Suspense } from 'react'

import skills from 'step-wise/edu/skills'

export default function Exercise({ id, state, status, split, giveUp, submit, newExercise }) {
	const Problem = React.lazy(() => import(`../exercises/${id}/Problem`))
	const Solution = React.lazy(() => import(`../exercises/${id}/Solution`))

	const [x, setX] = useState('')
	const handleSubmit = evt => {
		evt.preventDefault()
		submit({ ans: x })
	}
	const resetExercise = () => {
		setX('')
		newExercise()
	}

	return <>
		<Suspense fallback={<p>Loading exercise...</p>}>
			<h3>Problem (status: {status})</h3>
			<Problem state={state} />
			<h3>Input space</h3>
			<form onSubmit={handleSubmit}>
				<label>
					x = <input type="text" value={x} onChange={evt => setX(evt.target.value)} />
				</label>
				<input type="submit" value="Submit" />
				{status === 'started' ? <button onClick={split}>Split</button> : null}
				{status === 'split' ? <button onClick={giveUp}>Give up</button> : null}
			</form>
		</Suspense>
		{status === 'solved' || status === 'splitSolved' || status === 'givenUp' ? (
			<>
				{status === 'solved' || status === 'splitSolved' ? <p>Well done! You solved it.</p> : null}
				{status === 'givenUp' ? <p>Oh no ... hope you get the next one!</p> : null}
				<Suspense fallback={<p>Loading solution...</p>}>
					<h3>Solution</h3>
					<Solution state={state} />
				</Suspense>
				<p><button onClick={resetExercise}>Next problem</button></p>
			</>
		) : null}
	</>
}


