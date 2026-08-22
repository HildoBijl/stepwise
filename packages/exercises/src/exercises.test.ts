import { isObject, isPlainObject } from '@step-wise/js-utils'
import type { Skill } from '@step-wise/skill-definition'
import { isExercise } from '@step-wise/exercise-definition'
import { isExerciseCollection } from '@step-wise/exercise-bundling'
import { skillTree } from '@step-wise/skill-tree'

import * as allExercises from './exerciseGatherer'

// Prepare by getting all skill paths, and preparing a list of exercises that are discovered.
const skillsByPath = new Map(Object.values(skillTree).map(skill => [[...skill.groupPath, skill.id].join('/'), skill] as const))
const skillExerciseExport: { path: string[], skill: Skill, skillExerciseBundle: unknown }[] = []

// Walk through the gathered exports and couple every leaf to its skill-tree entry. Note when an exercise cannot be matched.
function collectExportedSkillExerciseBundle(value: unknown, path: string[] = []): void {
	// If the path matches a skill, assign the exercises to that skill.
	const pathString = path.join('/')
	const skill = skillsByPath.get(pathString)
	if (skill) {
		skillExerciseExport.push({ path, skill, skillExerciseBundle: value })
		return
	}

	// If we're not at a skill, zoom in deeper. Check that we have an object, and dive into it.
	test(`exercise export path "${pathString || '<root>'}" matches the skill tree`, () => {
		expect(isObject(value) && !Array.isArray(value)).toBe(true)
		expect([...skillsByPath.keys()].some(skillPath => skillPath.startsWith(`${pathString}${pathString ? '/' : ''}`))).toBe(true)
	})
	if (!isObject(value) || Array.isArray(value)) return
	for (const [key, child] of Object.entries(value)) collectExportedSkillExerciseBundle(child, [...path, key])
}
for (const [key, value] of Object.entries(allExercises)) collectExportedSkillExerciseBundle(value, [key])

// For each of the gathered skills with exercises, check if the given exercises are in the right format.
describe('Gathered exercises', () => {
	for (const { path, skill, skillExerciseBundle } of skillExerciseExport) {
		describe(`${skill.id} (${path.join('/')})`, () => {
			// Ensure that the skill's path matches the exercise's path. (Should already be checked, since the exercises were matched to this skill.)
			it('is exported at the path specified by the skill tree', () => {
				expect(path).toEqual([...skill.groupPath, skill.id])
			})

			// Ensure that the collection has the right format.
			it('has exercises and examples collections', () => {
				expect(isPlainObject(skillExerciseBundle)).toBe(true)
				if (!isPlainObject(skillExerciseBundle)) return
				expect(Object.keys(skillExerciseBundle).sort()).toEqual(['examples', 'exercises'])
				expect(isExerciseCollection(skillExerciseBundle.examples)).toBe(true)
				expect(isExerciseCollection(skillExerciseBundle.exercises)).toBe(true)
			})

			// Ensure that all given exercises are actual exercises.
			const validSkillExerciseBundle = isPlainObject(skillExerciseBundle) ? skillExerciseBundle : undefined
			if (!validSkillExerciseBundle) return
			for (const collectionName of ['examples', 'exercises'] as const) {
				const collection = validSkillExerciseBundle[collectionName]
				if (!isPlainObject(collection)) continue
				for (const [exerciseId, exercise] of Object.entries(collection)) {
					it(`${collectionName}.${exerciseId} satisfies the exercise format`, () => {
						expect(isExercise(exercise)).toBe(true)
					})
				}
			}
		})
	}
})
