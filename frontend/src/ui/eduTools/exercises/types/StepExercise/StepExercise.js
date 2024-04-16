// The StepExercise is an Exercise that can be split into parts. It must be passed a (main) Problem and then a steps array [{ Problem, Solution }]. Optional is a getFeedback parameter to extract feedback from input.

import React, { useState, useEffect } from 'react'

import { lastOf, repeat } from 'step-wise/util'
import { getStep, getPreviousProgress } from 'step-wise/eduTools'

import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../../containers'
import { ExerciseWrapper } from '../../wrappers'
import { ProblemContainer, SolutionContainer, ExerciseButtons, ContinuationButtons, MainFeedback } from '../../parts'
import { getAllFieldInputsFeedback } from '../../feedback'

import { Steps } from './Steps'

export function StepExercise(props) {
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
		<ContinuationButtons />
	</>
}

function stepExerciseGetFeedback(exerciseData) {
	const { progress, history, shared } = exerciseData

	// If a getSolution parameter is present (which is for most exercises) then give input on each individual field.
	if (shared.getSolution)
		return getAllFieldInputsFeedback(exerciseData)

	// If there's only a checkInput (which is in the remaining cases) then use it for a main feedback display.
	if (shared.checkInput) {
		// If the exercise is not split, only do so for the main problem.
		if (!progress.split)
			return { main: shared.checkInput(exerciseData, 0) }

		// If the exercise is split, give main feedback to each step that has just been submitted.
		const feedback = {}
		const previousProgress = getPreviousProgress(history)
		const step = getStep(previousProgress)
		repeat(step, (index) => {
			feedback[`step${index + 1}main`] = shared.checkInput(exerciseData, index + 1)
		})
		return feedback
	}

	// There is nothing to give feedback based on.
	return {}
}
