import { ensureNumber } from '@step-wise/utils'
import type { ExerciseHistory } from '@step-wise/exercise-definition'

import type { InputExerciseAction, InputExerciseInput } from '../InputExercise'

import type { StepExerciseProgress } from './types'

// Get the step which this problem is at.
export function getStep(progress: StepExerciseProgress | Record<string, never>): number {
	return 'split' in progress ? progress.step : 0
}

// Get the last given input from the user at the given step.
export function getLastInputAtStep(history: ExerciseHistory<InputExerciseAction, StepExerciseProgress>, step: number, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	step = ensureNumber(step, true)
	for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of history.
		const event = history[index]
		let userAction: InputExerciseAction | undefined
		if ('action' in event) userAction = event.action
		else if (userId && 'submissions' in event) userAction = (!requireResolved || 'progress' in event) ? event.submissions.find(submission => submission.userId === userId)?.action : undefined
		else throw new Error(`Invalid getLastInputAtStep case. Cannot determine if it is for a user or for a group.`)

		// If there is no valid input action, or it was made at the wrong step, keep looking. Otherwise give the input.
		if (!userAction || userAction.type !== 'input') continue
		const previousProgress = index === 0 ? {} : (history[index - 1] as any).progress ?? {}
		if (getStep(previousProgress) !== step) continue
		return userAction.input
	}
	return undefined
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInputAtStep(history: ExerciseHistory<InputExerciseAction, StepExerciseProgress>, step: number, userId?: string): boolean {
	return !!getLastInputAtStep(history, step, userId)
}
