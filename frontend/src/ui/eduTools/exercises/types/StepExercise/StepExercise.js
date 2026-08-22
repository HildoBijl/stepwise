// The StepExercise is an Exercise that can be split into parts. It must be passed a (main) Problem and then a steps array [{ Problem, Solution }]. Optional is a getFeedback parameter to extract feedback from input.

import React, { useState, useEffect } from 'react'

import { last, repeat } from '@step-wise/js-utils'
import { getPreviousState } from '@step-wise/exercise-definition'
import { getStep, hasPreviousInputAtStep } from '@step-wise/input-exercises'

import { useUserId } from 'api'
import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../../containers'
import { ExerciseWrapper } from '../../wrappers'
import { ProblemContainer, SolutionContainer, ExerciseButtons, ContinuationButtons, MainFeedback } from '../../parts'
import { getAllFieldInputsFeedback } from '../../feedback'

import { Steps } from './Steps'

export function StepExercise(props) {
	return <ExerciseWrapper getFeedback={props.getFeedback || stepExerciseGetFeedback}>
		<StepExerciseInner {...props} />
	</ExerciseWrapper>
}

function StepExerciseInner({ Problem: MainProblem, steps }) {
	const translate = useTranslator()
	const { mode, parameters, state, history, startNewExercise, example, inspection } = useExerciseData()
	const userId = useUserId()
	const [expandSolution, setExpandSolution] = useState(false)
	const { isAllInputEqual } = useFormData()
	const feedbackInput = useFeedbackInput()
	const { activateFirst } = useFieldControllerContext()

	// Upon loading, or on a change of the last event (something was submitted), focus on the first field. (Delay to ensure all fields are registered.))
	const lastEventId = last(history, { allowOutOfBounds: true })?.id
	useEffect(() => {
		if (!state.done)
			setTimeout(activateFirst, 1)
	}, [MainProblem, state, lastEventId, activateFirst])

	// Determine what to show.
	const hasMainProblemActions = hasPreviousInputAtStep(mode, history, 0, userId)
	const doneWithMainProblem = state.done || state.split
	const readOnly = inspection ? true : (example ? state.split : doneWithMainProblem)
	const showInputSpace = !state.split && (!inspection || hasMainProblemActions)
	const showMainFeedback = showInputSpace && (state.solved || state.split || isAllInputEqual(feedbackInput))

	return <>
		<ProblemContainer example={example} refresh={example && startNewExercise}>
			<FormPart readOnly={readOnly} showInputSpace={showInputSpace} showHints={!doneWithMainProblem}>
				<VerticalAdjuster>
					<TranslationSection entry="mainProblem">
						<MainProblem {...parameters} translate={addSection(translate, 'mainProblem')} />
					</TranslationSection>
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} />
			{state.split ? null : <ExerciseButtons stepwise={true} />}
		</ProblemContainer>
		{!expandSolution && !example && !inspection ? <SolutionContainer display={!!state.done && !state.split} onClick={() => setExpandSolution(true)} rotateIcon={false} /> : null}{/* This is a clickable dummy to expand the solution after the main problem has been solved directly. */}
		<Steps steps={steps} forceDisplay={expandSolution} />
		<ContinuationButtons />
	</>
}

function stepExerciseGetFeedback(data) {
	const { state, history, shared } = data

	// If a getSolution parameter is present (which is for most exercises) then give input on each individual field.
	if (shared.getSolution)
		return getAllFieldInputsFeedback(data)

	// If there's only a checkInput (which is in the remaining cases) then use it for a main feedback display.
	if (shared.checkInput) {
		// If the exercise is not split, only do so for the main problem.
		if (!state.split)
			return { main: shared.checkInput(data, 0) }

		// If the exercise is split, give main feedback to each step that has just been submitted.
		const feedback = {}
		const previousState = getPreviousState(data.instance)
		const step = getStep(previousState)
		repeat(step, (index) => {
			feedback[`step${index + 1}main`] = shared.checkInput(data, index + 1)
		})
		return feedback
	}

	// There is nothing to give feedback based on.
	return {}
}
