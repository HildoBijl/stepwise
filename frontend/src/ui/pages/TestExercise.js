import React, { useState } from 'react'

import { Problem, Solution } from 'step-wise/edu/exercises/exampleExercise1'

export default function TestExercise() {
	const state = { a: 4, b: 24 }
	const [x, setX] = useState('')

	const handleSubmit = evt => {
		evt.preventDefault()
		console.log('Submitting ' + x)
	}

	return (
		<>
			<p>This is a sample exercise for testing purposes.</p>
			<h3>Problem</h3>
			<p><Problem state={state} /></p>
			<h3>Input space</h3>
			<form onSubmit={handleSubmit}>
				<label>
					x = <input type="text" value={x} onChange={evt => setX(evt.target.value)} />
				</label>
				<input type="submit" value="Submit" />
			</form>
			<h3>Solution</h3>
			<p><Solution state={state} /></p>
		</>
	)
}
