import React from 'react'

import { getStep } from 'step-wise/eduTools'

import { TranslationSection, useTranslator, addSection } from 'i18n'
import { useUserId } from 'api/user'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart } from 'ui/form'

import { useExerciseData } from '../../containers'
import { ProblemContainer, SolutionContainer, MainFeedback } from '../../parts'

export function Steps({ steps, forceDisplay }) {
	// Walk through the steps, displaying them one by one.
	return steps.map((stepData, index) => <Step key={index} step={index + 1} forceDisplay={forceDisplay} {...stepData} />)
}

function Step({ step, Problem, Solution, forceDisplay }) {
	const translate = useTranslator()
	const userId = useUserId()
	const { state, progress, history } = useExerciseData()
	const { isAllInputEqual } = useFormData()
	const feedbackInput = useFeedbackInput()

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
	const showMainFeedback = showInputSpace && (stepProgress.done || isAllInputEqual(feedbackInput))

	return <>
		<ProblemContainer display={display} step={step}>
			<FormPart readOnly={doneWithStep} showInputSpace={showInputSpace} showHints={!doneWithStep}>
				<VerticalAdjuster>
					<TranslationSection entry={`step${step}.problem`}>
						<Problem {...state} translate={addSection(translate, `step${step}.problem`)} />
					</TranslationSection>
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} step={step} />
		</ProblemContainer>
		<SolutionContainer display={!!stepProgress.done} initialExpand={forceDisplay || !stepProgress.solved}>
			<TranslationSection entry={`step${step}.solution`}>
				<Solution {...state} translate={addSection(translate, `step${step}.solution`)} />
			</TranslationSection>
		</SolutionContainer>
	</>
}
