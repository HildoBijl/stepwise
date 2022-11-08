import React from 'react'

import { deepEquals } from 'step-wise/util/objects'
import { getStep } from 'step-wise/edu/exercises/util/stepExercise'

import { useUserId } from 'api/user'
import VerticalAdjuster from 'ui/components/layout/VerticalAdjuster'
import { useFormData } from 'ui/form/Form'
import { useFeedback } from 'ui/form/FeedbackProvider'
import FormPart from 'ui/form/FormPart'

import { useExerciseData } from '../../ExerciseContainer'
import ProblemContainer from '../../util/ProblemContainer'
import MainFeedback from '../../util/MainFeedback'
import SolutionContainer from '../../util/SolutionContainer'

export default function Steps({ steps, forceDisplay }) {
	// Walk through the steps, displaying them one by one.
	return steps.map((stepData, index) => <Step key={index} step={index + 1} forceDisplay={forceDisplay} {...stepData} />)
}

export function Step({ step, Problem, Solution, forceDisplay }) {
	const userId = useUserId()
	const { state, progress, history } = useExerciseData()
	const { isInputEqual } = useFormData()
	const { feedbackInput } = useFeedback()

	// Determine what to show.
	const exerciseStep = getStep(progress) // How far the student is with the exercise.
	const display = step <= exerciseStep || forceDisplay
	const stepProgress = (forceDisplay ? { done: true, solved: false } : progress[step]) || {}

	// If this step has had a submission, or is still active, show the input space.
	const hasSubmissions = history.some((event, index) => {
		if (index === 0 || history[index - 1].progress.step !== step)
			return false // Not at this step.
		if (event.action && event.action.type === 'input')
			return true // Single-user exercise with input at this step.
		if (event.submissions && event.submissions.some(submission => submission.action.type === 'input' && submission.userId === userId))
			return true // Group exercise with input by the user at this step.
		return false // Nothing found.
	})
	const doneWithStep = stepProgress.done
	const showInputSpace = !stepProgress.done || hasSubmissions
	const showMainFeedback = showInputSpace && (stepProgress.done || isInputEqual(feedbackInput))

	return <>
		<ProblemContainer display={display} step={step}>
			<FormPart readOnly={doneWithStep} showInputSpace={showInputSpace} showHints={!doneWithStep}>
				<VerticalAdjuster>
					<Problem {...state} />
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} step={step} />
		</ProblemContainer>
		<SolutionContainer display={!!stepProgress.done} initialExpand={forceDisplay || !stepProgress.solved}>
			<Solution {...state} />
		</SolutionContainer>
	</>
}