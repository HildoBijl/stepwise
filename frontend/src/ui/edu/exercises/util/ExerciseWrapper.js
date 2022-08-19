import React, { useMemo } from 'react'

import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'

import Form from 'ui/form/Form'
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
	// Extract all the data needed by the FeedbackProvider.
	const exerciseData = useExerciseData()
	const solution = useSolution()
	const data = useMemo(() => ({ ...exerciseData, solution }), [exerciseData, solution])

	// Determine the input that needs to be evaluated by the FeedbackProvider. When it changes, the feedback is adjusted.
	const feedbackInput = getLastInput(exerciseData.history)

	// Render the FeedbackProvider.
	return <FeedbackProvider getFeedback={getFeedback} input={feedbackInput} data={data}>{children}</FeedbackProvider>
}
