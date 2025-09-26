// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect, useRef } from 'react'

import { hasPreviousInput } from 'step-wise/eduTools'

import { useUserId } from 'api'
import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../containers'
import { ExerciseWrapper, useSolution } from '../wrappers'
import { ProblemContainer, SolutionContainer, ExerciseButtons, ContinuationButtons, MainFeedback } from '../parts'
import { getAllFieldInputsFeedback } from '../feedback'

export function SimpleExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || simpleExerciseGetFeedback}>
			<SimpleExerciseInner {...props} />
		</ExerciseWrapper>
	)
}

function SimpleExerciseInner({ Problem, Solution }) {
	const translate = useTranslator()
	const { state, progress, history, example, startNewExercise } = useExerciseData()
	const solution = useSolution(false) || {}
	const userId = useUserId()
	const { isAllInputEqual } = useFormData()
	const feedbackInput = useFeedbackInput()
	const { activateFirst } = useFieldControllerContext()
	const timeoutIndexRef = useRef()

	// Upon loading, or on history updates, focus on the first field. (Delay to ensure all fields are registered.)
	useEffect(() => {
		clearTimeout(timeoutIndexRef.current)
		if (!progress.done)
			timeoutIndexRef.current = setTimeout(activateFirst)
	}, [Problem, progress, history, activateFirst])

	// Determine what to show.
	const hasSubmissions = hasPreviousInput(history, userId) // Has there been an input action?
	const showInputSpace = !progress.done || hasSubmissions
	const showMainFeedback = showInputSpace && (progress.done || isAllInputEqual(feedbackInput))
	const showSolution = example || progress.done

	return <>
		<ProblemContainer example={example} refresh={example && startNewExercise}>
			<FormPart readOnly={!example && progress.done} showInputSpace={showInputSpace} showHints={!progress.done}>
				<VerticalAdjuster>
					<TranslationSection entry="problem">
						<Problem {...state} translate={addSection(translate, 'problem')} />
					</TranslationSection>
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} />
			<ExerciseButtons />
		</ProblemContainer>
		<SolutionContainer display={!!showSolution} initialExpand={!example && !progress.solved}>
			<TranslationSection entry="solution">
				<Solution {...state} {...solution} translate={addSection(translate, 'solution')} />
			</TranslationSection>
		</SolutionContainer>
		<ContinuationButtons />
	</>
}

function simpleExerciseGetFeedback(exerciseData) {
	const { shared } = exerciseData
	const { getSolution, checkInput } = shared || {}

	// If a getSolution parameter is present (which is for most exercises) then give input on each individual field.
	if (getSolution)
		return getAllFieldInputsFeedback(exerciseData)

	// If there's only a checkInput (which is in the remaining cases) then use it for a main feedback display.
	if (checkInput)
		return { main: checkInput(exerciseData) }

	// There is nothing to give feedback based on. (Should never happen.)
	return {}
}
