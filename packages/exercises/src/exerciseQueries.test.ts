import { describe, expect, it, vi } from 'vitest'

import { type Exercise } from '@step-wise/exercise-definition'
import { getByPath, isPlainObject } from '@step-wise/js-utils'
import { skillTree } from '@step-wise/skill-tree'

import * as exerciseRegistry from './exerciseRegistry'
import { getAllExercises, getExamples, getExercise, getExercises, hasExamples, hasExercises } from './exerciseQueries'

const skillsAndBundles = Object.values(skillTree).map(skill => ({
	skill,
	bundle: getByPath(exerciseRegistry, [...skill.groupPath, skill.id]),
}))
const populatedEntry = skillsAndBundles.find(({ bundle }) => isPlainObject(bundle) && isPlainObject(bundle.exercises) && Object.keys(bundle.exercises).length > 0)

if (!populatedEntry) throw new Error('Test setup error: expected at least one skill with exercises.')

describe('exercise queries', () => {
	it("retrieves a skill's examples and exercises", () => {
		const { skill, bundle } = populatedEntry
		expect(isPlainObject(bundle)).toBe(true)
		if (!isPlainObject(bundle)) return
		expect(getExercises(skill.id)).toBe(bundle.exercises)
		expect(getExamples(skill.id)).toBe(bundle.examples)
		expect(hasExercises(skill.id)).toBe(Object.keys(bundle.exercises as object).length > 0)
		expect(hasExamples(skill.id)).toBe(Object.keys(bundle.examples as object).length > 0)
	})

	it('returns undefined collections for a skill without an exercise bundle', async () => {
		const { skill } = populatedEntry
		const [registryExport] = skill.groupPath.length > 0 ? skill.groupPath : [skill.id]
		vi.resetModules()
		vi.doMock('./exerciseRegistry', () => ({ [registryExport]: {} }))
		try {
			const mockedQueries = await import('./exerciseQueries')
			expect(mockedQueries.getExercises(skill.id)).toBeUndefined()
			expect(mockedQueries.getExamples(skill.id)).toBeUndefined()
			expect(mockedQueries.hasExercises(skill.id)).toBe(false)
			expect(mockedQueries.hasExamples(skill.id)).toBe(false)
		} finally {
			vi.doUnmock('./exerciseRegistry')
		}
	})

	it('combines examples and exercises and retrieves definitions by ID', () => {
		const { skill } = populatedEntry
		const examples = getExamples(skill.id) ?? {}
		const exercises = getExercises(skill.id) ?? {}
		const combined = getAllExercises(skill.id)
		expect(combined).toEqual({ ...examples, ...exercises })
		for (const [exerciseId, exercise] of Object.entries(combined)) expect(getExercise(skill.id, exerciseId)).toBe(exercise)
		expect(getExercise(skill.id, '__unknown_exercise__')).toBeUndefined()
	})

	it('freezes returned bundles and collections', () => {
		const { skill, bundle } = populatedEntry
		const exercises = getExercises(skill.id)!
		expect(Object.isFrozen(bundle)).toBe(true)
		expect(Object.isFrozen(exercises)).toBe(true)
		expect(Object.isFrozen(getAllExercises(skill.id))).toBe(true)
		expect(() => { (exercises as Record<string, Exercise>).__test__ = Object.values(exercises)[0] }).toThrow(TypeError)
	})

	it('rejects different example and exercise definitions with the same ID', async () => {
		const exercise = {
			metadata: {},
			generateParameters: () => ({}),
			getInitialState: () => ({}),
			processSoloAction: () => ({}),
		} satisfies Exercise
		const example = { ...exercise }
		const path = [...populatedEntry.skill.groupPath, populatedEntry.skill.id]
		const mockedRegistry: Record<string, unknown> = {}
		let target = mockedRegistry
		for (const part of path.slice(0, -1)) target = target[part] = {} as Record<string, unknown>
		target[path[path.length - 1]] = { examples: { shared: example }, exercises: { shared: exercise } }

		vi.resetModules()
		vi.doMock('./exerciseRegistry', () => mockedRegistry)
		const mockedQueries = await import('./exerciseQueries')
		expect(() => mockedQueries.getAllExercises(populatedEntry.skill.id)).toThrow(/example and exercise "shared" use different definitions/)
		vi.doUnmock('./exerciseRegistry')
	})
})
