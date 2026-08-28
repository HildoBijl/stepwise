import { describe, expect, it } from 'vitest'

import { type Exercise } from '@step-wise/exercise-definition'

import { filterExerciseCollectionByMode, isEmptyExerciseCollection, isExerciseCollection } from './exerciseCollection.ts'

const exercise = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
} satisfies Exercise

describe('isExerciseCollection', () => {
	it('accepts an empty collection', () => {
		expect(isExerciseCollection({})).toBe(true)
	})

	it('accepts collections containing valid exercises', () => {
		expect(isExerciseCollection({ first: exercise, second: exercise })).toBe(true)
	})

	it.each(['MixedCase', 'internal space'])('accepts the exercise ID %j', exerciseId => {
		expect(isExerciseCollection({ [exerciseId]: exercise })).toBe(true)
	})

	it.each(['', ' leading', 'trailing ', ' both '])('rejects the invalid exercise ID %j', exerciseId => {
		expect(isExerciseCollection({ [exerciseId]: exercise })).toBe(false)
	})

	it.each([
		{},
		{ ...exercise, generateParameters: undefined },
		{ ...exercise, getInitialState: undefined },
		{ ...exercise, processSoloAction: undefined },
	])('rejects an invalid exercise: %p', invalidExercise => {
		expect(isExerciseCollection({ invalidExercise })).toBe(false)
	})

	it.each([undefined, null, [], 3, 'exercises', () => ({})])('rejects a non-plain collection: %p', value => {
		expect(isExerciseCollection(value)).toBe(false)
	})
})

describe('isEmptyExerciseCollection', () => {
	it('treats undefined as empty', () => {
		expect(isEmptyExerciseCollection(undefined)).toBe(true)
	})

	it('recognizes an empty collection', () => {
		expect(isEmptyExerciseCollection({})).toBe(true)
	})

	it('recognizes a non-empty collection', () => {
		expect(isEmptyExerciseCollection({ exercise })).toBe(false)
	})

	it('does not modify the supplied collection', () => {
		const collection = { exercise }
		const entries = Object.entries(collection)

		isEmptyExerciseCollection(collection)

		expect(Object.entries(collection)).toEqual(entries)
	})
})

describe('filterExerciseCollectionByMode', () => {
	const baseExercise = {
		metadata: {},
		generateParameters: () => ({}),
		getInitialState: () => ({}),
	}
	const soloExercise = { ...baseExercise, processSoloAction: () => ({}) } satisfies Exercise
	const groupExercise = { ...baseExercise, processGroupActions: () => ({}) } satisfies Exercise
	const dualModeExercise = { ...baseExercise, processSoloAction: () => ({}), processGroupActions: () => ({}) } satisfies Exercise
	const collection = { soloExercise, groupExercise, dualModeExercise }

	it('keeps solo and dual-mode exercises for solo mode', () => {
		expect(filterExerciseCollectionByMode(collection, 'solo')).toEqual({ soloExercise, dualModeExercise })
	})

	it('keeps group and dual-mode exercises for group mode', () => {
		expect(filterExerciseCollectionByMode(collection, 'group')).toEqual({ groupExercise, dualModeExercise })
	})

	it('returns an empty collection when no exercise supports the mode', () => {
		expect(filterExerciseCollectionByMode({ soloExercise }, 'group')).toEqual({})
	})

	it('returns a new collection without modifying the original exercises', () => {
		const filtered = filterExerciseCollectionByMode(collection, 'solo')
		expect(filtered).not.toBe(collection)
		expect(collection).toEqual({ soloExercise, groupExercise, dualModeExercise })
		expect(filtered.soloExercise).toBe(soloExercise)
	})

	it('rejects an unknown mode, including for an empty collection', () => {
		expect(() => filterExerciseCollectionByMode({}, 'unknown' as never)).toThrow(TypeError)
	})
})
