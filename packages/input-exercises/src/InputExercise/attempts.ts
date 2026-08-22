import type { ExerciseMode } from '@step-wise/exercise-definition'

import type { InputExerciseAttemptState } from './types'

export function hasAttempted(state: InputExerciseAttemptState, mode: ExerciseMode, userId?: string): boolean {
	switch (mode) {
		case 'solo':
			return state.attempted === true
		case 'group':
			if (userId === undefined) throw new TypeError(`A userId is required when checking attempts for a group exercise.`)
			return state.attemptedBy?.includes(userId) ?? false
		default:
			return throwUnsupportedMode(mode)
	}
}

export function addAttemptsToState<TState extends InputExerciseAttemptState>(state: TState, mode: ExerciseMode, userIds: readonly (string | undefined)[]): TState {
	if (userIds.length === 0) return state
	switch (mode) {
		case 'solo':
			return { ...state, attempted: true }
		case 'group': {
			const attemptedBy = new Set(state.attemptedBy)
			userIds.forEach(userId => {
				if (userId === undefined) throw new TypeError(`A userId is required when registering an attempt for a group exercise.`)
				attemptedBy.add(userId)
			})
			return { ...state, attemptedBy: [...attemptedBy] }
		}
		default:
			return throwUnsupportedMode(mode)
	}
}

function throwUnsupportedMode(mode: never): never {
	throw new Error(`Unsupported exercise mode: "${mode}".`)
}
