import React, { useMemo, useEffect } from 'react'

import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'

import { useUserId } from 'api/user'
import Form, { useFormData } from 'ui/form/Form'
import FeedbackProvider from 'ui/form/FeedbackProvider'

import { useExerciseData } from '../ExerciseContainer'

import SolutionProvider, { useSolution } from './SolutionProvider'

// ExerciseWrapper wraps an exercise in a Form and getFeedback function, providing support functionalities to exercises.
export default function ExerciseWrapper({ getFeedback, children }) {
	return (
		<Form>
			<SolutionProvider>
				<FeedbackWrapper getFeedback={getFeedback}>
					{children}
				</FeedbackWrapper>
			</SolutionProvider>
		</Form>
	)
}

function FeedbackWrapper({ getFeedback, children }) {
	// Extract the exercise data and merge in the solution when available.
	const exerciseData = useExerciseData()
	const solution = useSolution(false)
	const data = useMemo(() => solution === undefined ? exerciseData : ({ ...exerciseData, solution }), [exerciseData, solution])

	// Determine the input that the user made, and hence which needs to be evaluated by the FeedbackProvider. When it changes, the feedback is adjusted.
	const userId = useUserId()
	const feedbackInput = getLastInput(exerciseData.history, userId, true)

	// Upon page load, make sure that the last submitted (possibly unresolved) input is visible. This is also useful when a submission is resolved and the update comes in through a websocket connection.
	const { setAllInputSI } = useFormData()
	const lastInput = getLastInput(exerciseData.history, userId)
	useEffect(() => {
		if (lastInput)
			setAllInputSI(lastInput)
	}, [feedbackInput, lastInput, setAllInputSI])

	// Render the FeedbackProvider.
	return <FeedbackProvider getFeedback={getFeedback} input={feedbackInput} data={data}>{children}</FeedbackProvider>
}
