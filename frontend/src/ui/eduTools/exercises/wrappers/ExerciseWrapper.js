import React, { useMemo, useEffect } from 'react'

import { getLastInput, getExerciseName } from 'step-wise/eduTools'

import { useUserId } from 'api'
import { TranslationSection } from 'i18n'
import { Form, useFormData, FeedbackProvider } from 'ui/form'

import { useExerciseData } from '../containers'
import { useFormSubmitAction } from '../util'

import { SolutionProvider, useSolution } from './SolutionProvider'

// ExerciseWrapper wraps an exercise in a Form and getFeedback function, providing support functionalities to exercises.
export function ExerciseWrapper({ getFeedback, children }) {
	const submit = useFormSubmitAction()
	return (
		<Form submit={submit}>
			<TranslationWrapper>
				<SolutionProvider>
					<FeedbackWrapper getFeedback={getFeedback}>
						{children}
					</FeedbackWrapper>
				</SolutionProvider>
			</TranslationWrapper>
		</Form>
	)
}

function FeedbackWrapper({ getFeedback, children }) {
	// Extract the exercise data and merge in the solution when available.
	const exerciseData = useExerciseData()
	const solution = useSolution(false)
	const mergedExerciseData = useMemo(() => solution === undefined ? exerciseData : ({ ...exerciseData, solution }), [exerciseData, solution])

	// Determine both the input to show (usually the last submitted (possibly unresolved) input) and the last input which feedback was given on.
	const { inspection, history, historyIndex } = exerciseData
	const userId = useUserId()
	let feedbackInput, shownInput
	if (inspection) {
		shownInput = history[historyIndex]?.action?.input
		feedbackInput = shownInput
	} else {
		shownInput = getLastInput(history, userId)
		feedbackInput = getLastInput(history, userId, undefined, true)
	}

	// Upon page load, make sure that the input to show is visible. This is also useful when a submission is resolved and the update comes in through a websocket connection.
	const { setAllInputSI } = useFormData()
	useEffect(() => {
		if (shownInput)
			setAllInputSI(shownInput)
	}, [feedbackInput, shownInput, setAllInputSI])

	// Render the FeedbackProvider.
	return <FeedbackProvider getFeedback={getFeedback} input={feedbackInput} exerciseData={mergedExerciseData}>{children}</FeedbackProvider>
}

function TranslationWrapper({ children }) {
	const { exerciseId } = useExerciseData()
	const exerciseName = getExerciseName(exerciseId)
	return <TranslationSection entry={`${exerciseName}`}>{children}</TranslationSection>
}
