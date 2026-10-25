import React from 'react'

import { getCurrentStep } from '@step-wise/input-exercises'
import { TranslationArea, TranslationGroup } from '@step-wise/i18n'

import { useUserId } from 'api'
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
	const userId = useUserId()
	const { mode, parameters, state, history, example, inspection, historyIndex } = useExerciseData()
	const solution = useSolution(false) || {}
	const { isAllInputEqual } = useFormData()
	const feedbackInput = useFeedbackInput()

	// Determine what to show.
	const exerciseStep = getCurrentStep(state) // How far the student is with the exercise.
	const display = step <= exerciseStep || forceDisplay || !!example || inspection
	const stepState = (forceDisplay ? { done: true, solved: false } : state[step]) || {}

	// If this step has had an action, or is still active, show the input space.
	const hasPreviousActions = history.some((event, index) => {
		if (inspection && index > historyIndex)
			return false // We are past the inspection action index: future actions are ignored.
		if (index === 0 || history[index - 1].state.step !== step)
			return false // Not at this step.
		if (mode === 'solo' && event.action.type === 'input')
			return true // Single-user exercise with input at this step.
		if (mode === 'group' && event.actions.some(userAction => userAction.action.type === 'input' && userAction.userId === userId))
			return true // Group exercise with input by the user at this step.
		return false // Nothing found.
	})
	const doneWithStep = stepState.done
	const readOnly = inspection ? true : (example ? step !== exerciseStep : doneWithStep)
	const showInputSpace = (!inspection && !stepState.done && step === exerciseStep) || hasPreviousActions
	const showMainFeedback = showInputSpace && (stepState.done || isAllInputEqual(feedbackInput))
	const showSolution = !!(example || inspection || stepState.done)
	const initialSolutionExpand = !!(forceDisplay || inspection || (stepState.done && !stepState.solved))

	return <>
		<ProblemContainer activeProblem={step === exerciseStep} problemStep={step} display={!!display} step={step}>
			<FormPart part={step} readOnly={readOnly} showInputSpace={showInputSpace} showHints={!doneWithStep}>
				<VerticalAdjuster>
					<TranslationGroup path={`step${step}`}>
						<TranslationArea name="problem">
							<Problem {...parameters} />
						</TranslationArea>
					</TranslationGroup>
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} step={step} />
			{step === exerciseStep && (!stepState.done || example) ? <ExerciseButtons stepwise={true} /> : null}
		</ProblemContainer>
		<SolutionContainer problemStep={step} display={showSolution} initialExpand={initialSolutionExpand}>
			<TranslationGroup path={`step${step}`}>
				<TranslationArea name="solution">
					<Solution {...parameters} {...solution} />
				</TranslationArea>
			</TranslationGroup>
		</SolutionContainer>
	</>
}
