import { describe, expect, expectTypeOf, it } from 'vitest'

import type { ExerciseReducerResult, GroupExerciseReducer, SoloExerciseReducer } from './types.ts'

type Parameters = { target: number }
type Action = { type: 'answer', value: number }
type State = { done: boolean }
type Report = { correct: boolean }
type Context = { source: string }

describe('exercise reducer types', () => {
	it('supports synchronous and asynchronous reducer results with optional reports', async () => {
		const processSoloAction: SoloExerciseReducer<Action, State, Parameters, Report, Context> = ({ parameters, action, context }) => ({
			state: { done: action.value === parameters.target },
			report: { correct: action.value === parameters.target && context.source === 'test' },
		})
		const processGroupActions: GroupExerciseReducer<Action, State, Parameters, Report, Context> = async ({ actions, parameters, context }) => ({
			state: { done: context.source === 'test' && actions.some(({ action }) => action.value === parameters.target) },
		})

		const context = { source: 'test' }
		const soloResult = await processSoloAction({ parameters: { target: 2 }, state: { done: false }, action: { type: 'answer', value: 2 }, context })
		const groupResult = await processGroupActions({ parameters: { target: 2 }, state: { done: false }, actions: [], context })

		expect(soloResult).toEqual({ state: { done: true }, report: { correct: true } })
		expect(groupResult).toEqual({ state: { done: false } })
		expectTypeOf(soloResult).toEqualTypeOf<ExerciseReducerResult<State, Report>>()
		expectTypeOf(groupResult).toEqualTypeOf<ExerciseReducerResult<State, Report>>()
	})
})
