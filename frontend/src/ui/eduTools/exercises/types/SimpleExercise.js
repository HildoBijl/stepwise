// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect, useRef } from 'react'

import { hasPreviousInput } from 'step-wise/eduTools'

import { useUserId } from 'api/user'
import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../containers'
import { ExerciseWrapper, useSolution } from '../wrappers'
import { ProblemContainer, SolutionContainer, ExerciseButtons, MainFeedback } from '../parts'
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
	const { state, progress, history, example } = useExerciseData()
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

	return <>
		<ProblemContainer example={example}>
			<FormPart readOnly={progress.done} showInputSpace={showInputSpace} showHints={!progress.done}>
				<VerticalAdjuster>
					<TranslationSection entry="problem">
						<Problem {...state} translate={addSection(translate, 'problem')} />
					</TranslationSection>
				</VerticalAdjuster>
			</FormPart>
			<MainFeedback display={showMainFeedback} />
		</ProblemContainer>
		<SolutionContainer display={!!progress.done} initialExpand={!progress.solved}>
			<TranslationSection entry="solution">
				<Solution {...state} {...solution} translate={addSection(translate, 'solution')} />
			</TranslationSection>
		</SolutionContainer>
		<ExerciseButtons />
	</>
}

function simpleExerciseGetFeedback(exerciseData) {
	const { shared } = exerciseData

	// If a getSolution parameter is present (which is for most exercises) then give input on each individual field.
	if (shared.getSolution)
		return getAllFieldInputsFeedback(exerciseData)

	// If there's only a checkInput (which is in the remaining cases) then use it for a main feedback display.
	if (shared.checkInput)
		return { main: shared.checkInput(exerciseData) }

	// There is nothing to give feedback based on. (Should never happen.)
	return {}
}
