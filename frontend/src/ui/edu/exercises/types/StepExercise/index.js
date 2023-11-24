// The StepExercise is an Exercise that can be split into parts. It must be passed a (main) Problem and then a steps array [{ Problem, Solution }]. Optional is a getFeedback parameter to extract feedback from input.

import React, { useState, useEffect } from 'react'

import { numberArray, lastOf } from 'step-wise/util'
import { getStep, getPreviousProgress } from 'step-wise/eduTools'

import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../../../../eduTools/exercises/containers/ExerciseContainer' // ToDo: change ref
import { ExerciseWrapper } from '../../../../eduTools/exercises/wrappers'
import { ProblemContainer, SolutionContainer, ExerciseButtons, MainFeedback } from '../../../../eduTools/exercises/parts'

import Steps from './Steps'

export { getStep, getPreviousProgress }

export default function StepExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || stepExerciseGetFeedback}>
			<StepExerciseInner {...props} />
		</ExerciseWrapper>
	)
}

function StepExerciseInner({ Problem: MainProblem, steps }) {
	const translate = useTranslator()
	const { state, progress, history } = useExerciseData()
	const [expandSolution, setExpandSolution] = useState(false)
	const { isAllInputEqual } = useFormData()
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
	const showMainFeedback = showInputSpace && (progress.solved || progress.split || isAllInputEqual(feedbackInput))

	return <>
		<ProblemContainer>
			<FormPart readOnly={doneWithMainProblem} showInputSpace={showInputSpace} showHints={!doneWithMainProblem}>
				<VerticalAdjuster>
					<TranslationSection entry="mainProblem">
						<MainProblem {...state} translate={addSection(translate, 'mainProblem')} />
					</TranslationSection>
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
