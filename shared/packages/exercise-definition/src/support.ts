import type { ExerciseAction, ExerciseProgress, ExerciseHistory } from './types'

// Get the last action for the given user from an exercise history.
export function getLastAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>, userId: string): TAction | undefined {
	// On no history, return nothing.
	if (history.length === 0) return undefined

	// If the last event has an action, it's a single-user event. Return the action.
	const lastEvent = history[history.length - 1]
	if ('action' in lastEvent) return lastEvent.action

	// The exercise is a group exercise. Find the last resolved event and look through the submissions to get the current user's action.
	const lastResolvedEvent = ('progress' in lastEvent) ? lastEvent : history[history.length - 2]
	if (!lastResolvedEvent || !('submissions' in lastResolvedEvent)) return undefined
	return lastResolvedEvent.submissions.find(submission => submission.userId === userId)?.action
}

// Get the last progress object from the history array.
export function getLastProgress<TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<ExerciseAction, TProgress>): TProgress | Record<string, never> {
	// On no events, return the default progress.
	if (history.length === 0) return {}

	// On a single-user exercise, return the last progress.
	const lastEvent = history[history.length - 1]
	if ('progress' in lastEvent) return lastEvent.progress!

	// On a group exercise, return the last resolved progress.
	if (history.length === 1) return {}
	const lastResolvedEvent = history[history.length - 2]
	if ('progress' in lastResolvedEvent) return lastResolvedEvent.progress!

	// Should never happen.
	throw new Error(`Invalid exercise history: encountered two consecutive history events without a progress object.`)
}

// Get the second-to-last progress object from the history array.
export function getPreviousProgress<TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<ExerciseAction, TProgress>): TProgress | Record<string, never> {
	// On no events, return the default progress.
	if (history.length <= 1) return {}

	// On a single-user exercise, return the second-to-last progress.
	const lastEvent1 = history[history.length - 1]
	const lastEvent2 = history[history.length - 2]
	if ('progress' in lastEvent1 && 'progress' in lastEvent2) return lastEvent2.progress!

	// On a group exercise, return the progress of the third-last event, if it exists.
	if ('progress' in lastEvent2 && history.length <= 2) return {}
	const lastEvent3 = history[history.length - 3]
	if ('progress' in lastEvent2 && 'progress' in lastEvent3) return lastEvent3.progress!

	// Should never happen.
	throw new Error(`Invalid exercise history: encountered two consecutive history events without a progress object.`)
}

// Check if a progress object marks the exercise as done.
export function isProgressDone(progress: ExerciseProgress): boolean {
	return progress.done === true
}

// Check if an exercise history indicates that the exercise is done.
export function isHistoryDone<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>): boolean {
	return isProgressDone(getLastProgress(history))
}
