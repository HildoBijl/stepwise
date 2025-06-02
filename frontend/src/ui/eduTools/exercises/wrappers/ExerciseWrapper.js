import React, { useMemo, useEffect } from 'react'

import { getLastInput } from 'step-wise/eduTools'

import { useUserId } from 'api/user'
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

	// Determine the input that the user made, and hence which needs to be evaluated by the FeedbackProvider. When it changes, the feedback is adjusted.
	const userId = useUserId()
	const feedbackInput = getLastInput(exerciseData.history, userId, undefined, true)

	// Upon page load, make sure that the last submitted (possibly unresolved) input is visible. This is also useful when a submission is resolved and the update comes in through a websocket connection.
	const { setAllInputSI } = useFormData()
	const lastInput = getLastInput(exerciseData.history, userId)
	useEffect(() => {
		if (lastInput)
			setAllInputSI(lastInput)
	}, [feedbackInput, lastInput, setAllInputSI])

	// Render the FeedbackProvider.
	return <FeedbackProvider getFeedback={getFeedback} input={feedbackInput} exerciseData={mergedExerciseData}>{children}</FeedbackProvider>
}

function TranslationWrapper({ children }) {
	const { exerciseId } = useExerciseData()
	return <TranslationSection entry={`${exerciseId}`}>{children}</TranslationSection>
}
