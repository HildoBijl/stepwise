// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React from 'react'

import { objectsEqual } from 'step-wise/util/objects'

import ExerciseWrapper from '../form/ExerciseWrapper'
import { useExerciseData } from '../ExerciseContainer'
import { useFormData } from '../form/Form'
import { useFeedback } from '../form/FeedbackProvider'
import { useButtons } from './util'
import Status from '../form/Status'

export default function SimpleExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || simpleExerciseGetFeedback}>
			<Contents {...props} />
		</ExerciseWrapper>
	)
}

function Contents({ Problem, Solution }) {
	const { state, progress, history } = useExerciseData()
	const { input } = useFormData()
	const { feedback, prevInput } = useFeedback()
	const buttons = useButtons()

	// Determine what to show.
	const hasSubmissions = history.some(event => event.action.type === 'input') // Has there been an input action.
	const showInputSpace = !progress.done || hasSubmissions

	return (
		<Status done={progress.done} solved={progress.solved} showInputSpace={showInputSpace}>
			<Problem {...state} />
			{feedback.main !== undefined && objectsEqual(input, prevInput) ? <p>{feedback.main ? 'Correct' : 'Wrong'}</p> : null}
			{progress.done ? <Solution {...state} /> : null}{/* ToDo: put this in a wrapper that checks the status. */}
			{buttons}
		</Status>
	)
}

function simpleExerciseGetFeedback({ state, input, shared }) {
	if (!shared.checkInput)
		return {}
	return { main: shared.checkInput(state, input) }
}
