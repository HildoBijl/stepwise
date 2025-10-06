import React from 'react'

import { getStep } from 'step-wise/eduTools'

import { useUserId } from 'api'
import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart } from 'ui/form'

import { useExerciseData } from '../../containers'
import { useSolution } from '../../wrappers'
import { ProblemContainer, SolutionContainer, ExerciseButtons, MainFeedback } from '../../parts'

export function Steps({ steps, forceDisplay }) {
	// Walk through the steps, displaying them one by one.
	return steps.map((stepData, index) => <Step key={index} step={index + 1} forceDisplay={forceDisplay} {...stepData} />)
}

function Step({ step, Problem, Solution, forceDisplay }) {
	const translate = useTranslator()
	const userId = useUserId()
	const { state, progress, history, example, inspection, historyIndex } = useExerciseData()
	const solution = useSolution(false) || {}
	const { isAllInputEqual } = useFormData()
	const feedbackInput = useFeedbackInput()

	// Determine what to show.
	const exerciseStep = getStep(progress) // How far the student is with the exercise.
	const display = step <= exerciseStep || forceDisplay || !!example || inspection
	const stepProgress = (forceDisplay ? { done: true, solved: false } : progress[step]) || {}

	// If this step has had a submission, or is still active, show the input space.
	const hasSubmissions = history.some((event, index) => {
		if (inspection && index > historyIndex)
			return false // We are past the inspection (submission) index: future submissions are ignored.
		if (index === 0 || history[index - 1].progress.step !== step)
			return false // Not at this step.
		if (event.action && event.action.type === 'input')
			return true // Single-user exercise with input at this step.
		if (event.submissions && event.submissions.some(submission => submission.action.type === 'input' && submission.userId === userId))
			return true // Group exercise with input by the user at this step.
		return false // Nothing found.
	})
	const doneWithStep = stepProgress.done
	const readOnly = inspection ? true : (example ? step !== exerciseStep : doneWithStep)
	const showInputSpace = (!inspection && !stepProgress.done && step === exerciseStep) || hasSubmissions
	const showMainFeedback = showInputSpace && (stepProgress.done || isAllInputEqual(feedbackInput))
	const showSolution = !!(example || inspection || stepProgress.done)
	const initialSolutionExpand = !!(forceDisplay || inspection || (stepProgress.done && !stepProgress.solved))

	return <>
		<ProblemContainer display={!!display} step={step}>
			<FormPart readOnly={readOnly} showInputSpace={showInputSpace} showHints={!doneWithStep}>
				<VerticalAdjuster>
					<TranslationSection entry={`step${step}.problem`}>
						<Problem {...state} translate={addSection(translate, `step${step}.problem`)} />
					</TranslationSection>
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} step={step} />
			{step === exerciseStep && (!stepProgress.done || example) ? <ExerciseButtons stepwise={true} /> : null}
		</ProblemContainer>
		<SolutionContainer display={showSolution} initialExpand={initialSolutionExpand}>
			<TranslationSection entry={`step${step}.solution`}>
				<Solution {...state} {...solution} translate={addSection(translate, `step${step}.solution`)} />
			</TranslationSection>
		</SolutionContainer>
	</>
}
