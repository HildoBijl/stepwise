import type { ExerciseAction, ExerciseProgress } from '../../fundamentals'
import type { GroupExerciseHistory } from './types'

function ensureUserId(userId: string | undefined): string {
	if (userId === undefined) throw new TypeError(`A userId is required when retrieving an action from a group exercise history.`)
	return userId
}

function getLastAction<TAction extends ExerciseAction, TProgress extends ExerciseProgress>(history: GroupExerciseHistory<TAction, TProgress>, userId?: string): TAction | undefined {
	const ensuredUserId = ensureUserId(userId)
	for (let index = history.length - 1; index >= 0; index--) {
		const action = history[index].submissions.find(submission => submission.userId === ensuredUserId)?.action
		if (action) return action
	}
	return undefined
}

function getLastResolvedAction<TAction extends ExerciseAction, TProgress extends ExerciseProgress>(history: GroupExerciseHistory<TAction, TProgress>, userId?: string): TAction | undefined {
	const ensuredUserId = ensureUserId(userId)
	for (let index = history.length - 1; index >= 0; index--) {
		const event = history[index]
		if (!('progress' in event)) continue
		const action = event.submissions.find(submission => submission.userId === ensuredUserId)?.action
		if (action) return action
	}
	return undefined
}

function getLastProgress<TAction extends ExerciseAction, TProgress extends ExerciseProgress>(history: GroupExerciseHistory<TAction, TProgress>, offset = 0): TProgress | Record<string, never> {
	let remaining = offset
	for (let index = history.length - 1; index >= 0; index--) {
		const event = history[index]
		if (!('progress' in event)) continue
		if (remaining === 0) return event.progress
		remaining--
	}
	return {}
}

export const groupHistorySupport = {
	getLastAction,
	getLastResolvedAction,
	getLastProgress,
}
