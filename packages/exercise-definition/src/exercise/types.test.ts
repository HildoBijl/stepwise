import { describe, expect, expectTypeOf, it } from 'vitest'

import type { ExerciseReducerResult, GroupExerciseReducer, SoloExerciseReducer } from './types.ts'

type Parameters = { target: number }
type Action = { type: 'answer', value: number }
type State = { done: boolean }
type Report = { correct: boolean }

describe('exercise reducer types', () => {
	it('supports synchronous and asynchronous reducer results with optional reports', async () => {
		const processSoloAction: SoloExerciseReducer<Action, State, Parameters, Report> = ({ parameters, action }) => ({
			state: { done: action.value === parameters.target },
			report: { correct: action.value === parameters.target },
		})
		const processGroupActions: GroupExerciseReducer<Action, State, Parameters, Report> = async ({ actions, parameters }) => ({
			state: { done: actions.some(({ action }) => action.value === parameters.target) },
		})

		const soloResult = await processSoloAction({ parameters: { target: 2 }, state: { done: false }, action: { type: 'answer', value: 2 } })
		const groupResult = await processGroupActions({ parameters: { target: 2 }, state: { done: false }, actions: [] })

		expect(soloResult).toEqual({ state: { done: true }, report: { correct: true } })
		expect(groupResult).toEqual({ state: { done: false } })
		expectTypeOf(soloResult).toEqualTypeOf<ExerciseReducerResult<State, Report>>()
		expectTypeOf(groupResult).toEqualTypeOf<ExerciseReducerResult<State, Report>>()
	})
})
