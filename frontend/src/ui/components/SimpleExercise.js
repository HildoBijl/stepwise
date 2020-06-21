// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong.

import React from 'react'

import { useExerciseData } from './ExerciseContainer'
import Form, { useFormData } from './Form'
import FeedbackProvider, { useFeedback } from './FeedbackProvider'

export default function SimpleExercise(props) {
	return (
		<Form>
			<FeedbackProvider>
				<Contents {...props} />
			</FeedbackProvider>
		</Form>
	)
}

function Contents({ Problem, Solution }) {
	// Obtain data.
	const { progress, dispatch, startNewExercise } = useExerciseData()
	const { input } = useFormData()
	const { getFeedback } = useFeedback()

	// Set up button handlers.
	const submit = () => {
		dispatch({ type: 'submit', input })
		getFeedback(input)
	}
	const giveUp = () => dispatch({ type: 'giveUp' })

	return <>
		<Problem />
		{
			!progress.done ? (
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