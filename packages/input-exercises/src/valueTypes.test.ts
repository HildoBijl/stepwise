import { describe, expect, it } from 'vitest'

import { hasOnlyKeys, isPlainObject, isString } from '@step-wise/js-utils'
import type { SerializationAdapter } from '@step-wise/serialization'
import type { InputValueAdapter } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import { IntegerType, MultipleChoiceType, type ValueTypes } from '@step-wise/value-types'

import { getLastInput } from './InputExercise/history.ts'
import { buildMonoExercise } from './MonoExercise/reducer.ts'
import { buildStepExercise } from './StepExercise/reducer.ts'
import { createStepExerciseMetadata } from './StepExercise/preprocessing.ts'
const CustomType = 'CustomValue'
type CustomInputValue = { type: typeof CustomType, value: string }
type SerializedCustomValue = { type: typeof CustomType, value: string }

class CustomValue {
	readonly type = CustomType
	constructor(readonly value: string) {}
}

const inputValueAdapter = {
	isInputValue: (value: unknown): value is CustomInputValue => isCustomData(value),
	isDomainValue: (value: unknown): value is CustomValue => value instanceof CustomValue,
	interpret: value => new CustomValue(value.value),
	toInputValue: value => ({ type: CustomType, value: value.value }),
} satisfies InputValueAdapter<CustomInputValue, CustomValue>

const serializationAdapter = {
	isDomainValue: (value: unknown): value is CustomValue => value instanceof CustomValue,
	isSerializedValue: (value: unknown): value is SerializedCustomValue => isCustomData(value),
	serialize: value => ({ type: CustomType, value: value.value }),
	deserialize: value => new CustomValue(value.value),
} satisfies SerializationAdapter<CustomValue, SerializedCustomValue>

const equalityAdapter = {
	isValue: (value: unknown): value is CustomValue => value instanceof CustomValue,
	areEqual: (inputValue, expectedValue) => inputValue.value === expectedValue.value,
} satisfies ValueEqualityAdapter<CustomValue>

const valueTypes = {
	[CustomType]: {
		inputValue: inputValueAdapter,
		serialization: serializationAdapter,
		equality: equalityAdapter,
	},
} satisfies ValueTypes

const rawInput = (value: string) => ({ answer: { type: CustomType, value } })

function isCustomData(value: unknown): value is CustomInputValue {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && value.type === CustomType && isString(value.value)
}

describe('input-exercise value types', () => {
	it('uses custom adapters for MonoExercise parameters, input, and checking data', () => {
		const exercise = buildMonoExercise<{ answer: CustomValue }, { answer: CustomValue }>({
			metadata: {},
			valueTypes,
			generateParameters: () => ({ answer: new CustomValue('correct') }),
			getSolution: parameters => ({ answer: parameters.answer }),
			checkInput: ({ parameters, input, solution, areValuesEqual }) => {
				expect(parameters.answer).toBeInstanceOf(CustomValue)
				expect(input.answer).toBeInstanceOf(CustomValue)
				expect(areValuesEqual(CustomType, input.answer, solution!.answer)).toBe(true)
				return true
			},
		})
		const parameters = exercise.generateParameters(false)
		expect(parameters).toEqual({ answer: { type: CustomType, value: 'correct' } })
		expect(exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput('correct') } })).toMatchObject({ solved: true, done: true })
		expect(exercise.processGroupActions({ parameters, state: {}, actions: [{ userId: 'user', action: { type: 'input', input: rawInput('correct') } }] })).toMatchObject({ solved: true, done: true })
	})

	it('uses custom adapters throughout a StepExercise', () => {
		const exercise = buildStepExercise<{ answer: CustomValue }>({
			metadata: createStepExerciseMetadata(['custom-step']),
			valueTypes,
			generateParameters: () => ({ answer: new CustomValue('correct') }),
			checkInput: ({ parameters, input, areValuesEqual }) => parameters.answer instanceof CustomValue && input.answer instanceof CustomValue && areValuesEqual(CustomType, input.answer, parameters.answer),
		})
		const parameters = exercise.generateParameters(false)
		expect(exercise.processSoloAction({ parameters, state: {}, action: { type: 'input', input: rawInput('correct') } })).toMatchObject({ solved: true, done: true })
	})

	it('uses the exercise value types when interpreting history', () => {
		const exercise = buildMonoExercise({ metadata: {}, valueTypes, checkInput: () => false })
		const instance = { mode: 'solo', initialState: {}, history: [{ action: { type: 'input', input: rawInput('previous') }, state: {} }] } as const
		expect(getLastInput(exercise, instance)).toEqual({ answer: new CustomValue('previous') })
	})

	it('rejects incomplete supplied adapters while allowing omitted value types', () => {
		const exercise = buildMonoExercise({ metadata: {}, checkInput: () => false })
		expect(exercise.valueOperations.interpretInput({ answer: { type: IntegerType, value: '2' } })).toEqual({ answer: 2 })
		expect(exercise.valueOperations.toInputValue([1], MultipleChoiceType)).toEqual({ type: MultipleChoiceType, value: [1] })
		expect(() => buildMonoExercise({ metadata: {}, valueTypes: { Broken: { serialization: { serialize: () => ({}) } } } as never, checkInput: () => false })).toThrow(/complete/)
	})
})
