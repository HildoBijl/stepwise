import React from 'react'

import Form from 'ui/form/Form'
import FeedbackProvider from 'ui/form/FeedbackProvider'

import SolutionProvider from './SolutionProvider'

// ExerciseWrapper wraps an exercise in a Form and getFeedback function, providing support functionalities to exercises.
export default function ExerciseWrapper(props) {
	return (
		<Form>
			<SolutionProvider>
				<FeedbackProvider getFeedback={props.getFeedback}>
					{props.children}
				</FeedbackProvider>
			</SolutionProvider>
		</Form>
	)
}
