// The StepExercise is an Exercise that can be split into parts. It must be passed a (main) Problem and then a steps array [{ Problem, Solution }]. Optional is a getFeedback parameter to extract feedback from input.

import React, { useState, useEffect } from 'react'

import { numberArray } from 'step-wise/util/arrays'
import { inputSetsEqual } from 'step-wise/inputTypes'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import VerticalAdjuster from 'ui/components/layout/VerticalAdjuster'
import { useFormData } from 'ui/form/Form'
import { useFeedback } from 'ui/form/FeedbackProvider'
import Status from 'ui/form/Status'
import { useFieldControllerContext } from 'ui/form/FieldController'

import { useExerciseData } from '../../ExerciseContainer'
import ExerciseWrapper from '../../util/ExerciseWrapper'
import ProblemContainer from '../../util/ProblemContainer'
import MainFeedback from '../../util/MainFeedback'
import SolutionContainer from '../../util/SolutionContainer'
import ExerciseButtons from '../../util/ExerciseButtons'
import Steps from './Steps'

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
	const { input } = useFormData()
	const { feedbackInput } = useFeedback()
	const { activateFirst } = useFieldControllerContext()

	// Upon loading, or on history updates, focus on the first field.
	useEffect(() => {
		if (!progress.done)
			activateFirst()
	}, [MainProblem, progress, history, activateFirst])

	// Determine what to show.
	const showInputSpace = !progress.split
	const showMainFeedback = showInputSpace && (progress.solved || progress.split || inputSetsEqual(input, feedbackInput))

	return <>
		<ProblemContainer>
			<Status showInputSpace={showInputSpace} done={progress.done || progress.split}>
				<VerticalAdjuster>
					<MainProblem {...state} />
				</VerticalAdjuster>
			</Status>
			<MainFeedback display={showMainFeedback} />
		</ProblemContainer>
		{!expandSolution ? <SolutionContainer display={!!progress.done && !progress.split} onClick={() => setExpandSolution(true)} rotateIcon={false} /> : null}{/* This is a clickable dummy to expand the solution after the main problem has been solved directly. */}
		<Steps steps={steps} forceDisplay={expandSolution} />
		<ExerciseButtons stepwise={true} />
	</>
}

function stepExerciseGetFeedback({ state, input, progress, prevProgress, shared }) {
	const feedback = {}
	if (!shared.checkInput)
		return feedback

	// If we're not split, use the default function.
	feedback.main = shared.checkInput(state, input, 0)
	if (!progress.split)
		return feedback

	// We're split! Find the step the user was at during his last action. Provide feedback until that step.
	const step = getStep(prevProgress)
	numberArray(1, step).forEach(index => {
		feedback[index] = { main: shared.checkInput(state, input, index) }
	})
	return feedback
}
