import React from 'react'

import Form from '../../../form/Form'
import FeedbackProvider from '../../../form/FeedbackProvider'

// ExerciseWrapper wraps an exercise in a Form and getFeedback function, providing support functionalities to exercises.
export default function ExerciseWrapper(props) {
	return (
		<Form>
			<FeedbackProvider getFeedback={props.getFeedback}>
				{props.children}
			</FeedbackProvider>
		</Form>
	)
}