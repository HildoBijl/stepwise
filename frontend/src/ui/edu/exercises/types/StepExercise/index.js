// The StepExercise is an Exercise that can be split into parts. It must be passed a (main) Problem and then a steps array [{ Problem, Solution }]. Optional is a getFeedback parameter to extract feedback from input.

import React, { useState, useEffect } from 'react'

import { numberArray, lastOf } from 'step-wise/util/arrays'
import { getStep, getPreviousProgress } from 'step-wise/edu/exercises/util/stepExercise'

import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../../ExerciseContainer'
import ExerciseWrapper from '../../util/ExerciseWrapper'
import ProblemContainer from '../../util/ProblemContainer'
import MainFeedback from '../../util/MainFeedback'
import SolutionContainer from '../../util/SolutionContainer'
import ExerciseButtons from '../../util/ExerciseButtons'

import Steps from './Steps'

export { getStep, getPreviousProgress }

export default function StepExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || stepExerciseGetFeedback}>
			<Contents {...props} />
		</ExerciseWrapper>
	)
}

function Contents({ Problem: MainProblem, steps }) {
	const { state, progress, history } = useExerciseData()
	const [expandSolution, setExpandSolution] = useState(false)
	const { isInputEqual } = useFormData()
	const feedbackInput = useFeedbackInput()
	const { activateFirst } = useFieldControllerContext()

	// Upon loading, or on a change of the last event (something was submitted), focus on the first field. (Delay to ensure all fields are registered.))
	const lastEventId = lastOf(history)?.id
	useEffect(() => {
		if (!progress.done)
			setTimeout(activateFirst, 1)
	}, [MainProblem, progress, lastEventId, activateFirst])

	// Determine what to show.
	const doneWithMainProblem = progress.done || progress.split
	const showInputSpace = !progress.split
	const showMainFeedback = showInputSpace && (progress.solved || progress.split || isInputEqual(feedbackInput))

	return <>
		<ProblemContainer>
			<FormPart readOnly={doneWithMainProblem} showInputSpace={showInputSpace} showHints={!doneWithMainProblem}>
				<VerticalAdjuster>
					<MainProblem {...state} />
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} />
		</ProblemContainer>
		{!expandSolution ? <SolutionContainer display={!!progress.done && !progress.split} onClick={() => setExpandSolution(true)} rotateIcon={false} /> : null}{/* This is a clickable dummy to expand the solution after the main problem has been solved directly. */}
		<Steps steps={steps} forceDisplay={expandSolution} />
		<ExerciseButtons stepwise={true} />
	</>
}

function stepExerciseGetFeedback({ state, input, progress, history, shared }) {
	const feedback = {}
	if (!shared.checkInput)
		return feedback

	// If we're not split, use the default function.
	if (!progress.split) {
		feedback.main = shared.checkInput(state, input, 0)
		return feedback
	}

	// We're split! Find the step the user was at during his last action. Provide feedback until that step.
	const previousProgress = getPreviousProgress(history)
	const step = getStep(previousProgress)
	if (step > 0) {
		numberArray(1, step).forEach(index => {
			feedback[`step${index}main`] = shared.checkInput(state, input, index)
		})
	}
	return feedback
}
