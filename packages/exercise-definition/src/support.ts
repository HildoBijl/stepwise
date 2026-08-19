import type { ExerciseAction, ExerciseProgress, ExerciseHistory, GroupExerciseHistory, SoloExerciseHistory } from './types'

export function createSoloExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(events: readonly { action: TAction, progress: TProgress }[] = []): SoloExerciseHistory<TAction, TProgress> {
	return { mode: 'solo', events }
}

export function createGroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(events: GroupExerciseHistory<TAction, TProgress>['events'] = []): GroupExerciseHistory<TAction, TProgress> {
	return { mode: 'group', events }
}

function ensureGroupUserId(userId: string | undefined): string {
	if (userId === undefined) throw new TypeError(`A userId is required when retrieving an action from a group exercise history.`)
	return userId
}

// Get the latest resolved action for a solo user or a given group user.
export function getLastResolvedAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: SoloExerciseHistory<TAction, TProgress>): TAction | undefined
export function getLastResolvedAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: GroupExerciseHistory<TAction, TProgress>, userId: string): TAction | undefined
export function getLastResolvedAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>, userId?: string): TAction | undefined {
	if (history.mode === 'solo') return history.events.at(-1)?.action

	const ensuredUserId = ensureGroupUserId(userId)
	for (let index = history.events.length - 1; index >= 0; index--) {
		const event = history.events[index]
		if (!('progress' in event)) continue
		return event.submissions.find(submission => submission.userId === ensuredUserId)?.action
	}
	return undefined
}

// Get the latest action, including a pending group submission when present.
export function getLastAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: SoloExerciseHistory<TAction, TProgress>): TAction | undefined
export function getLastAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: GroupExerciseHistory<TAction, TProgress>, userId: string): TAction | undefined
export function getLastAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>, userId?: string): TAction | undefined {
	if (history.mode === 'solo') return history.events.at(-1)?.action

	const ensuredUserId = ensureGroupUserId(userId)
	for (let index = history.events.length - 1; index >= 0; index--) {
		const action = history.events[index].submissions.find(submission => submission.userId === ensuredUserId)?.action
		if (action) return action
	}
	return undefined
}

// Get the last progress object from the history array.
export function getLastProgress<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>): TProgress | Record<string, never> {
	return getProgressFromEnd(history, 0)
}

// Get the second-to-last progress object from the history array.
export function getPreviousProgress<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>): TProgress | Record<string, never> {
	return getProgressFromEnd(history, 1)
}

function getProgressFromEnd<TAction extends ExerciseAction, TProgress extends ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>, offset: number): TProgress | Record<string, never> {
	let remaining = offset
	for (let index = history.events.length - 1; index >= 0; index--) {
		const event = history.events[index]
		if (!('progress' in event)) continue
		if (remaining === 0) return event.progress
		remaining--
	}
	return {}
}

// Check if a progress object marks the exercise as done.
export function isProgressDone(progress: ExerciseProgress): boolean {
	return progress.done === true
}

// Check if an exercise history indicates that the exercise is done.
export function isHistoryDone<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(history: ExerciseHistory<TAction, TProgress>): boolean {
	return isProgressDone(getLastProgress(history))
}
