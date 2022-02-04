import React from 'react'

import { deepEquals } from 'step-wise/util/objects'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import VerticalAdjuster from 'ui/components/layout/VerticalAdjuster'
import { useFormData } from 'ui/form/Form'
import { useFeedback } from 'ui/form/FeedbackProvider'
import Status from 'ui/form/Status'

import { useExerciseData } from '../../ExerciseContainer'
import ProblemContainer from '../../util/ProblemContainer'
import MainFeedback from '../../util/MainFeedback'
import SolutionContainer from '../../util/SolutionContainer'

export default function Steps({ steps, forceDisplay }) {
	// Walk through the steps, displaying them one by one.
	return steps.map((stepData, index) => <Step key={index} step={index + 1} forceDisplay={forceDisplay} {...stepData} />)
}

export function Step({ step, Problem, Solution, forceDisplay }) {
	const { state, progress, history } = useExerciseData()
	const { input } = useFormData()
	const { feedbackInput } = useFeedback()

	// Determine what to show.
	const exerciseStep = getStep(progress) // How far the student is with the exercise.
	const display = step <= exerciseStep || forceDisplay
	const stepProgress = (forceDisplay ? { done: true, solved: false } : progress[step]) || {}

	// If this step has had a submission, or is still active, show the input space.
	const hasSubmissions = history.some((event, index) => (event.action.type === 'input' && index > 0 && history[index - 1].progress.step === step))
	const showInputSpace = !stepProgress.done || hasSubmissions
	const showMainFeedback = showInputSpace && (stepProgress.done || deepEquals(input, feedbackInput))

	return <>
		<ProblemContainer display={display} step={step}>
			<Status showInputSpace={showInputSpace} done={stepProgress.done}>
				<VerticalAdjuster>
					<Problem {...state} />
				</VerticalAdjuster>
			</Status>
			<MainFeedback display={showMainFeedback} step={step} />
		</ProblemContainer>
		<SolutionContainer display={!!stepProgress.done} initialExpand={forceDisplay || !stepProgress.solved}>
			<Solution {...state} />
		</SolutionContainer>
	</>
}