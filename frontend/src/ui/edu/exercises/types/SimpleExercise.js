// The SimpleExercise is an Exercise that cannot be split. It's just one question and a function that checks whether the input is right or wrong. It must be passed a Problem and Solution component. Optional is a getFeedback parameter to extract feedback from input.

import React, { useEffect, useRef } from 'react'

import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'

import { useUserId } from 'api/user'
import { TranslationSection, useTranslator, addSection } from 'i18n'
import { VerticalAdjuster } from 'ui/components'
import { useFormData, useFeedbackInput, FormPart, useFieldControllerContext } from 'ui/form'

import { useExerciseData } from '../ExerciseContainer'
import ExerciseWrapper from '../util/ExerciseWrapper'
import ProblemContainer from '../util/ProblemContainer'
import MainFeedback from '../util/MainFeedback'
import SolutionContainer from '../util/SolutionContainer'
import ExerciseButtons from '../util/ExerciseButtons'

export default function SimpleExercise(props) {
	return (
		<ExerciseWrapper getFeedback={props.getFeedback || simpleExerciseGetFeedback}>
			<SimpleExerciseInner {...props} />
		</ExerciseWrapper>
	)
}

function SimpleExerciseInner({ Problem, Solution }) {
	const translate = useTranslator()
	const { state, progress, history } = useExerciseData()
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
	const hasSubmissions = !!getLastInput(history, userId) // Has there been an input action?
	const showInputSpace = !progress.done || hasSubmissions
	const showMainFeedback = showInputSpace && (progress.done || isAllInputEqual(feedbackInput))

	return <>
		<ProblemContainer>
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
				<Solution {...state} translate={addSection(translate, 'problem')} />
			</TranslationSection>
		</SolutionContainer>
		<ExerciseButtons />
	</>
}

function simpleExerciseGetFeedback({ state, input, shared }) {
	if (!shared.checkInput)
		return {}
	return { main: shared.checkInput(state, input) }
}
