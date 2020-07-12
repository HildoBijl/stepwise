// The StepExercise is an Exercise that can be split into parts. It must be passed a (main) Problem and then a steps array [{ Problem, Solution }]. Optional is a getFeedback parameter to extract feedback from input.

import React from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { objectsEqual } from 'step-wise/util/objects'
import { getStep } from 'step-wise/edu/util/exercises/stepExercise'

import ExerciseWrapper from '../../form/ExerciseWrapper'
import { useExerciseData } from '../../ExerciseContainer'
import { useFormData } from '../../form/Form'
import { useFeedback } from '../../form/FeedbackProvider'
import { useButtons } from '../util'
import Status from '../../form/Status'
import Step from './Step'

export default function StepExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || stepExerciseGetFeedback}>
			<Contents {...props} />
		</ExerciseWrapper>
	)
}

function Contents({ Problem: MainProblem, steps }) {
	const { state, progress } = useExerciseData()
	const { input } = useFormData()
	const { feedback, prevInput } = useFeedback()
	const buttons = useButtons()

	// Determine what to show.
	const showInputSpace = !progress.split
	const step = getStep(progress)

	return (
		<Status done={progress.done} solved={progress.solved} showInputSpace={showInputSpace}>
			<MainProblem {...state} />
			{feedback.main !== undefined && objectsEqual(input, prevInput) ? <p>{feedback.main ? 'Correct' : 'Wrong'}</p> : null}
			{steps.map((stepData, index) => (index <= step - 1 ? <Step key={index} step={index + 1} progress={progress[index + 1]} {...stepData} /> : null))}
			{buttons}
		</Status>
	)
}

function stepExerciseGetFeedback({ state, input, progress, prevProgress, shared }) {
	if (!shared.checkInput)
		return {}

	// If we're not split, use the default function.
	if (!progress.split)
		return { main: shared.checkInput(state, input, 0) }

	// We're split! Find the step the user was at during his last action. Provide feedback until that step.
	const step = getStep(prevProgress)
	const feedback = {}
	numberArray(1, step).forEach(index => {
		feedback[index] = shared.checkInput(state, input, index)
	})
	return feedback
}
