import { isExercise } from '@step-wise/exercise-definition'
import { isExerciseCollection } from '@step-wise/exercise-bundling'
import { type SolutionDefinition, resolveSolution } from '@step-wise/input-exercises'
import { deserializeData } from '@step-wise/serialization'
import type { Skill } from '@step-wise/skill-definition'
import { skillTree } from '@step-wise/skill-tree'
import { isObject, isPlainObject } from '@step-wise/js-utils'

import * as exerciseRegistry from './exerciseRegistry'

type SolvableExercise = {
	getSolution?: SolutionDefinition
}

const skillsByPath = new Map(Object.values(skillTree).map(skill => [[...skill.groupPath, skill.id].join('/'), skill] as const))
const skillExerciseExports: { path: string[], skill: Skill, bundle: unknown }[] = []

function collectSkillExerciseBundles(value: unknown, path: string[] = []): void {
	const pathString = path.join('/')
	const skill = skillsByPath.get(pathString)
	if (skill) {
		skillExerciseExports.push({ path, skill, bundle: value })
		return
	}

	test(`registry path "${pathString || '<root>'}" leads to a skill`, () => {
		expect(isObject(value) && !Array.isArray(value)).toBe(true)
		expect([...skillsByPath.keys()].some(skillPath => skillPath.startsWith(`${pathString}${pathString ? '/' : ''}`))).toBe(true)
	})
	if (!isObject(value) || Array.isArray(value)) return
	for (const [key, child] of Object.entries(value)) collectSkillExerciseBundles(child, [...path, key])
}

for (const [key, value] of Object.entries(exerciseRegistry)) collectSkillExerciseBundles(value, [key])

describe('exercise registry', () => {
	for (const { path, skill, bundle } of skillExerciseExports) {
		describe(`${skill.id} (${path.join('/')})`, () => {
			it('is exported at the path specified by the skill tree', () => {
				expect(path).toEqual([...skill.groupPath, skill.id])
			})

			it('has valid examples and exercises collections', () => {
				expect(isPlainObject(bundle)).toBe(true)
				if (!isPlainObject(bundle)) return
				expect(Object.keys(bundle).sort()).toEqual(['examples', 'exercises'])
				expect(isExerciseCollection(bundle.examples)).toBe(true)
				expect(isExerciseCollection(bundle.exercises)).toBe(true)
			})

			if (isPlainObject(bundle) && isPlainObject(bundle.examples) && isPlainObject(bundle.exercises)) {
				const { examples, exercises } = bundle

				it('uses the same definition for IDs shared by examples and exercises', () => {
					for (const [exerciseId, example] of Object.entries(examples)) {
						if (Object.hasOwn(exercises, exerciseId)) expect(exercises[exerciseId]).toBe(example)
					}
				})

				for (const [collectionName, collection, example] of [['examples', examples, true], ['exercises', exercises, false]] as const) {
					for (const [exerciseId, exercise] of Object.entries(collection)) {
						describe(`${collectionName}.${exerciseId}`, () => {
							it('is a valid exercise connected to its containing skill', () => {
								expect(isExercise(exercise)).toBe(true)
								if (!isExercise(exercise)) return
								const { metadata } = exercise
								if (metadata.skill !== undefined) {
									expect(metadata.skill).toBe(skill.id)
								} else {
									expect(metadata.setup).toBeDefined()
									expect(metadata.setup?.getSkillSet().has(skill.id)).toBe(true)
								}
							})

							it(`generates valid ${example ? 'example' : 'exercise'} data`, () => {
								expect(isExercise(exercise)).toBe(true)
								if (!isExercise(exercise)) return
								const storedParameters = exercise.generateParameters(example)
								expect(isPlainObject(storedParameters)).toBe(true)
								const initialState = exercise.getInitialState(storedParameters)
								expect(isPlainObject(initialState)).toBe(true)

								const { getSolution } = exercise as typeof exercise & SolvableExercise
								if (getSolution !== undefined) {
									const parameters = deserializeData(storedParameters)
									expect(isPlainObject(parameters)).toBe(true)
									if (!isPlainObject(parameters)) return
									const solution = resolveSolution(getSolution, parameters)
									expect(isPlainObject(solution)).toBe(true)
								}
							})
						})
					}
				}
			}
		})
	}
})
