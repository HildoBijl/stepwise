import { ensureNumber } from '@step-wise/js-utils'
import type { ExerciseHistory, ExerciseMode, GroupExerciseHistory, SoloExerciseHistory } from '@step-wise/exercise-definition'

import type { InputExerciseAction, InputExerciseInput } from '../InputExercise'

import type { StepExerciseState } from './types'

// Get the step which this problem is at.
export function getStep(state: StepExerciseState | Record<string, never>): number {
	return 'split' in state ? state.step : 0
}

// Get the last given input from the user at the given step.
export function getLastInputAtStep(mode: ExerciseMode, history: ExerciseHistory<InputExerciseAction, StepExerciseState>, step: number, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	step = ensureNumber(step, { nonNegative: true })
	if (mode === 'group' && userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)

	if (mode === 'solo') for (let index = history.length - 1; index >= 0; index--) {
		const userAction = (history as SoloExerciseHistory<InputExerciseAction, StepExerciseState>)[index].action
		if (userAction.type !== 'input') continue
		const previousState = getStateBeforeEvent(history, index)
		if (getStep(previousState) === step) return userAction.input
	}

	if (mode === 'group') for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of history.
		const event = (history as GroupExerciseHistory<InputExerciseAction, StepExerciseState>)[index]
		const userAction = (!requireResolved || 'state' in event) ? event.actions.find(userAction => userAction.userId === userId)?.action : undefined

		// If there is no valid input action, or it was made at the wrong step, keep looking. Otherwise give the input.
		if (!userAction || userAction.type !== 'input') continue
		const previousState = getStateBeforeEvent(history, index)
		if (getStep(previousState) !== step) continue
		return userAction.input
	}
	return undefined
}

function getStateBeforeEvent(history: ExerciseHistory<InputExerciseAction, StepExerciseState>, eventIndex: number): StepExerciseState | Record<string, never> {
	for (let index = eventIndex - 1; index >= 0; index--) {
		const event = history[index]
		if ('state' in event) return event.state
	}
	return {}
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInputAtStep(mode: ExerciseMode, history: ExerciseHistory<InputExerciseAction, StepExerciseState>, step: number, userId?: string): boolean {
	return !!getLastInputAtStep(mode, history, step, userId)
}
