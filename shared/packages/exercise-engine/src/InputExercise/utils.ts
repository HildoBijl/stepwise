import type { ExerciseHistory } from '@step-wise/exercise-definition'

import type { InputExerciseAction, InputExerciseInput } from './types'

// Get the last given input from the user. For group-exercises, this may be an unresolved submission input, unless the requireResolved flag is set to true.
export function getLastInput(history: ExerciseHistory<InputExerciseAction>, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of history.
		const event = history[index]
		let userAction: InputExerciseAction | undefined
		if ('action' in event) userAction = event.action
		else if (userId && 'submissions' in event) userAction = (!requireResolved || 'progress' in event) ? event.submissions.find(submission => submission.userId === userId)?.action : undefined
		else throw new Error(`Invalid getLastInput case. Cannot determine if it is for a user or for a group.`)

		// If there is no valid input action, keep looking. Otherwise give the input.
		if (!userAction || userAction.type !== 'input') continue
		return userAction.input
	}
	return undefined
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInput(history: ExerciseHistory<InputExerciseAction>, userId?: string): boolean {
	return !!getLastInput(history, userId)
}
