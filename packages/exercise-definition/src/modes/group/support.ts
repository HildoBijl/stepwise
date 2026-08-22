import type { ExerciseAction, ExerciseState } from '../../atomTypes'

import type { GroupExerciseHistory } from './types'

function ensureUserId(userId: string | undefined): string {
	if (userId === undefined) throw new TypeError(`A userId is required when retrieving an action from a group exercise history.`)
	return userId
}

function getLastAction<TAction extends ExerciseAction, TState extends ExerciseState>(history: GroupExerciseHistory<TAction, TState>, userId?: string): TAction | undefined {
	const ensuredUserId = ensureUserId(userId)
	for (let index = history.length - 1; index >= 0; index--) {
		const action = history[index].submissions.find(submission => submission.userId === ensuredUserId)?.action
		if (action) return action
	}
	return undefined
}

function getLastResolvedAction<TAction extends ExerciseAction, TState extends ExerciseState>(history: GroupExerciseHistory<TAction, TState>, userId?: string): TAction | undefined {
	const ensuredUserId = ensureUserId(userId)
	for (let index = history.length - 1; index >= 0; index--) {
		const event = history[index]
		if (!('state' in event)) continue
		const action = event.submissions.find(submission => submission.userId === ensuredUserId)?.action
		if (action) return action
	}
	return undefined
}

function getLastState<TAction extends ExerciseAction, TState extends ExerciseState>(history: GroupExerciseHistory<TAction, TState>, initialState: TState, offset = 0): TState {
	let remaining = offset
	for (let index = history.length - 1; index >= 0; index--) {
		const event = history[index]
		if (!('state' in event)) continue
		if (remaining === 0) return event.state
		remaining--
	}
	return initialState
}

export const groupHistorySupport = {
	getLastAction,
	getLastResolvedAction,
	getLastState,
}
