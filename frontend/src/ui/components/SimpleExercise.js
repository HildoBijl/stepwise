// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong.

import React from 'react'

import { useExerciseData } from './ExerciseLoader'
import { useFormData } from './Form'
import Form from './Form'

export default function SimpleExercise(props) {
	return <Form><Contents {...props} /></Form>
}

function Contents({ Problem, Solution }) {
	// Obtain data.
	const { done, dispatch, startNewExercise } = useExerciseData()
	const { input } = useFormData()

	// Set up button handlers.
	const submit = () => dispatch({ type: 'submit', input })
	const giveUp = () => dispatch({ type: 'giveUp' })

	// Get state.

	return <>
		<Problem />
		{
			!done ? (
				<p>
					<button type="button" onClick={submit}>Submit</button>
					<button type="button" onClick={giveUp}>Give up</button>
				</p>
			) : (
					<>
						<Solution />
						<p><button type="button" onClick={startNewExercise}>Next problem</button></p>
					</>
				)
		}
	</>
}