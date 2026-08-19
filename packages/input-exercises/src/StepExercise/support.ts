import { ensureNumber } from '@step-wise/js-utils'
import type { ExerciseHistory } from '@step-wise/exercise-definition'

import type { InputExerciseAction, InputExerciseInput } from '../InputExercise'

import type { StepExerciseProgress } from './types'

// Get the step which this problem is at.
export function getStep(progress: StepExerciseProgress | Record<string, never>): number {
	return 'split' in progress ? progress.step : 0
}

// Get the last given input from the user at the given step.
export function getLastInputAtStep(history: ExerciseHistory<InputExerciseAction, StepExerciseProgress>, step: number, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	step = ensureNumber(step, { nonNegative: true })
	if (history.mode === 'group' && userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)

	if (history.mode === 'solo') for (let index = history.events.length - 1; index >= 0; index--) {
		const userAction = history.events[index].action
		if (userAction.type !== 'input') continue
		const previousProgress = getProgressBeforeEvent(history, index)
		if (getStep(previousProgress) === step) return userAction.input
	}

	if (history.mode === 'group') for (let index = history.events.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of history.
		const event = history.events[index]
		const userAction = (!requireResolved || 'progress' in event) ? event.submissions.find(submission => submission.userId === userId)?.action : undefined

		// If there is no valid input action, or it was made at the wrong step, keep looking. Otherwise give the input.
		if (!userAction || userAction.type !== 'input') continue
		const previousProgress = getProgressBeforeEvent(history, index)
		if (getStep(previousProgress) !== step) continue
		return userAction.input
	}
	return undefined
}

function getProgressBeforeEvent(history: ExerciseHistory<InputExerciseAction, StepExerciseProgress>, eventIndex: number): StepExerciseProgress | Record<string, never> {
	for (let index = eventIndex - 1; index >= 0; index--) {
		const event = history.events[index]
		if ('progress' in event) return event.progress
	}
	return {}
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInputAtStep(history: ExerciseHistory<InputExerciseAction, StepExerciseProgress>, step: number, userId?: string): boolean {
	return !!getLastInputAtStep(history, step, userId)
}
