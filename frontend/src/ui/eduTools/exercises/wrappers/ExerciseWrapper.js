import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useTheme } from '@mui/material'

import { getCurrentStep, getLastRawInput } from '@step-wise/input-exercises'

import { useUserId } from 'api'
import { TranslationSection } from 'i18n'
import { useVisible } from 'ui/components'
import { Form, FeedbackProvider } from 'ui/form'

import { useExerciseData } from '../containers'
import { useFormSubmitAction } from '../util'

import { SolutionProvider, useSolution } from './SolutionProvider'

const ExerciseScrollingContext = createContext()

export function useExerciseScrolling() {
	const scrollToExercisePart = useContext(ExerciseScrollingContext)
	if (!scrollToExercisePart)
		throw new Error('Cannot scroll an exercise part outside an ExerciseWrapper.')
	return scrollToExercisePart
}

// ExerciseWrapper wraps an exercise in a Form and getFeedback function, providing support functionalities to exercises.
export function ExerciseWrapper({ getFeedback, children }) {
	const submit = useFormSubmitAction()

	// Determine the initial input for the form. (And overwrite it if this updates, for instance in a group exercise through a websocket connection.) In inspection mode, get the requested one, and otherwise the latest one.
	const userId = useUserId()
	const exerciseData = useExerciseData()
	const { history, inspection, historyIndex } = exerciseData
	const initialInput = inspection ? history[historyIndex]?.action?.input : getLastRawInput(exerciseData, userId)
	const exerciseRef = useRef()
	const scrollToExercisePart = useExercisePartScrolling(exerciseRef)
	const visible = useVisible()
	const currentStep = exerciseData.shared.type === 'step' ? getCurrentStep(exerciseData.state) : 0
	useScrollToActiveProblem(exerciseRef, visible, currentStep, !!exerciseData.state.done)

	// Render all the components that we wrap exercises in.
	return <div ref={exerciseRef}>
		<ExerciseScrollingContext.Provider value={scrollToExercisePart}>
			<Form submit={submit} initialInput={initialInput} interpretInput={exerciseData.valueOperations.interpretInput}>
				<TranslationWrapper>
					<SolutionProvider>
						<FeedbackWrapper getFeedback={getFeedback}>
							{children}
						</FeedbackWrapper>
					</SolutionProvider>
				</TranslationWrapper>
			</Form>
		</ExerciseScrollingContext.Provider>
	</div>
}

function useExercisePartScrolling(exerciseRef) {
	const theme = useTheme()
	const animationCleanup = useRef()
	useEffect(() => () => animationCleanup.current?.(), [])

	return useCallback((step, { part = 'problem' } = {}) => {
		animationCleanup.current?.()
		const animationFrame = requestAnimationFrame(() => {
			const exercisePart = exerciseRef.current?.querySelector(`[data-exercise-${part}-step="${step}"]`)
			animationCleanup.current = exercisePart
				? scrollDownToExercisePart(exercisePart, theme.transitions.duration.standard + 25)
				: undefined
		})
		animationCleanup.current = () => cancelAnimationFrame(animationFrame)
	}, [exerciseRef, theme.transitions.duration.standard])
}

// When an exercise appears, show its active problem. When it advances, only catch up to the completed problem if needed.
function useScrollToActiveProblem(exerciseRef, visible, currentStep, exerciseDone) {
	const theme = useTheme()
	const scrollDuration = theme.transitions.duration.standard + 25
	const previousStep = useRef(currentStep)
	const wasDone = useRef(exerciseDone)
	const wasVisible = useRef(false)

	useEffect(() => {
		if (!visible) {
			previousStep.current = currentStep
			wasDone.current = exerciseDone
			return undefined
		}

		const advancedStep = previousStep.current !== currentStep
		const completedExercise = !wasDone.current && exerciseDone
		const completedStep = wasVisible.current && (advancedStep || completedExercise)
			? (advancedStep ? previousStep.current : currentStep)
			: undefined
		const scrollTarget = completedStep === undefined
			? (!wasVisible.current ? exerciseRef.current?.querySelector('[data-active-exercise-problem]') : undefined)
			: exerciseRef.current?.querySelector(`[data-exercise-problem-step="${completedStep}"]`)
		previousStep.current = currentStep
		wasDone.current = exerciseDone
		wasVisible.current = true

		if (!scrollTarget)
			return undefined
		if (completedStep !== undefined)
			return scrollDownToExercisePart(scrollTarget, scrollDuration)

		let secondFrame
		const firstFrame = requestAnimationFrame(() => {
			secondFrame = requestAnimationFrame(() => {
				if (scrollTarget.isConnected)
					window.scrollTo({ top: getProblemScrollPosition(scrollTarget) })
			})
		})
		return () => {
			cancelAnimationFrame(firstFrame)
			cancelAnimationFrame(secondFrame)
		}
	}, [exerciseRef, visible, currentStep, exerciseDone, scrollDuration])
}

// Smoothly follow a completed problem while the next problem expands and creates more scrolling space.
function scrollDownToExercisePart(problem, duration) {
	if (!problem.isConnected || problem.getBoundingClientRect().top <= getProblemScrollOffset())
		return undefined

	const initialScrollPosition = window.scrollY
	const startTime = performance.now()
	let animationFrame
	const updateScrollPosition = currentTime => {
		if (!problem.isConnected)
			return

		const progress = Math.min((currentTime - startTime) / duration, 1)
		const easedProgress = 1 - ((1 - progress) ** 3)
		const targetScrollPosition = getProblemScrollPosition(problem)
		window.scrollTo({ top: initialScrollPosition + ((targetScrollPosition - initialScrollPosition) * easedProgress) })
		if (progress < 1)
			animationFrame = requestAnimationFrame(updateScrollPosition)
	}
	animationFrame = requestAnimationFrame(updateScrollPosition)
	return () => cancelAnimationFrame(animationFrame)
}

function getProblemScrollPosition(problem) {
	return window.scrollY + problem.getBoundingClientRect().top - getProblemScrollOffset()
}

function getProblemScrollOffset() {
	const headerBottom = document.querySelector('[data-scroll-header]')?.getBoundingClientRect().bottom ?? 0
	return headerBottom + 8
}

function FeedbackWrapper({ getFeedback, children }) {
	// Extract the exercise data and merge in the solution when available.
	const exerciseData = useExerciseData()
	const solution = useSolution(false)
	const mergedExerciseData = useMemo(() => solution === undefined ? exerciseData : ({ ...exerciseData, solution }), [exerciseData, solution])

	// Determine both the input to show (usually the last submitted (possibly unresolved) input) and the last input which feedback was given on.
	const { inspection, history, historyIndex } = exerciseData
	const userId = useUserId()
	const feedbackInput = inspection ? history[historyIndex]?.action?.input : getLastRawInput(exerciseData, userId, { resolvedOnly: true })

	// Render the FeedbackProvider.
	return <FeedbackProvider getFeedback={getFeedback} input={feedbackInput} exerciseData={mergedExerciseData}>
		{children}
	</FeedbackProvider>
}

function TranslationWrapper({ children }) {
	const { exerciseId } = useExerciseData()
	return <TranslationSection entry={`${exerciseId}`}>{children}</TranslationSection>
}
