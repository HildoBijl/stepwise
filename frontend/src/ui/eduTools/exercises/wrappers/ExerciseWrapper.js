import React, { useMemo } from 'react'

import { getLastInput } from '@step-wise/input-exercises'

import { useUserId } from 'api'
import { TranslationSection } from 'i18n'
import { Form, FeedbackProvider } from 'ui/form'

import { useExerciseData } from '../containers'
import { useFormSubmitAction } from '../util'

import { SolutionProvider, useSolution } from './SolutionProvider'

// ExerciseWrapper wraps an exercise in a Form and getFeedback function, providing support functionalities to exercises.
export function ExerciseWrapper({ getFeedback, children }) {
	const submit = useFormSubmitAction()

	// Determine the initial input for the form. (And overwrite it if this updates, for instance in a group exercise through a websocket connection.) In inspection mode, get the requested one, and otherwise the latest one.
	const userId = useUserId()
	const { history, inspection, historyIndex } = useExerciseData()
	const initialInput = inspection ? history.events[historyIndex]?.action?.input : getLastInput(history, userId)

	// Render all the components that we wrap exercises in.
	return <Form submit={submit} initialInput={initialInput}>
		<TranslationWrapper>
			<SolutionProvider>
				<FeedbackWrapper getFeedback={getFeedback}>
					{children}
				</FeedbackWrapper>
			</SolutionProvider>
		</TranslationWrapper>
	</Form>
}

function FeedbackWrapper({ getFeedback, children }) {
	// Extract the exercise data and merge in the solution when available.
	const exerciseData = useExerciseData()
	const solution = useSolution(false)
	const mergedExerciseData = useMemo(() => solution === undefined ? exerciseData : ({ ...exerciseData, solution }), [exerciseData, solution])

	// Determine both the input to show (usually the last submitted (possibly unresolved) input) and the last input which feedback was given on.
	const { inspection, history, historyIndex } = exerciseData
	const userId = useUserId()
	const feedbackInput = inspection ? history.events[historyIndex]?.action?.input : getLastInput(history, userId, true)

	// Render the FeedbackProvider.
	return <FeedbackProvider getFeedback={getFeedback} input={feedbackInput} exerciseData={mergedExerciseData}>
		{children}
	</FeedbackProvider>
}

function TranslationWrapper({ children }) {
	const { exerciseId } = useExerciseData()
	return <TranslationSection entry={`${exerciseId}`}>{children}</TranslationSection>
}
