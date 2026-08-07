import { isObject, isPlainObject } from '@step-wise/utils'
import type { Skill } from '@step-wise/skill-definition'
import { isExercise } from '@step-wise/exercise-definition'
import { isExerciseContainer } from '@step-wise/exercise-bundling'
import { skillTree } from '@step-wise/skill-tree'

import * as allExercises from './exerciseGatherer'

// Prepare by getting all skill paths, and preparing a list of exercises that are discovered.
const skillsByPath = new Map(Object.values(skillTree).map(skill => [[...skill.path, skill.id].join('/'), skill] as const))
const skillExerciseExport: { path: string[], skill: Skill, skillExercises: unknown }[] = []

// Walk through the gathered exports and couple every leaf to its skill-tree entry. Note when an exercise cannot be matched.
function collectExportedSkillExercises(value: unknown, path: string[] = []): void {
	// If the path matches a skill, assign the exercises to that skill.
	const pathString = path.join('/')
	const skill = skillsByPath.get(pathString)
	if (skill) {
		skillExerciseExport.push({ path, skill, skillExercises: value })
		return
	}

	// If we're not at a skill, zoom in deeper. Check that we have an object, and dive into it.
	test(`exercise export path "${pathString || '<root>'}" matches the skill tree`, () => {
		expect(isObject(value) && !Array.isArray(value)).toBe(true)
		expect([...skillsByPath.keys()].some(skillPath => skillPath.startsWith(`${pathString}${pathString ? '/' : ''}`))).toBe(true)
	})
	if (!isObject(value) || Array.isArray(value)) return
	for (const [key, child] of Object.entries(value)) collectExportedSkillExercises(child, [...path, key])
}
for (const [key, value] of Object.entries(allExercises)) collectExportedSkillExercises(value, [key])

// For each of the gathered skills with exercises, check if the given exercises are in the right format.
describe('Gathered exercises', () => {
	for (const { path, skill, skillExercises } of skillExerciseExport) {
		describe(`${skill.id} (${path.join('/')})`, () => {
			// Ensure that the skill's path matches the exercise's path. (Should already be checked, since the exercises were matched to this skill.)
			it('is exported at the path specified by the skill tree', () => {
				expect(path).toEqual([...skill.path, skill.id])
			})

			// Ensure that the container has the right format.
			it('has exercises and examples containers', () => {
				expect(isPlainObject(skillExercises)).toBe(true)
				if (!isPlainObject(skillExercises)) return
				expect(Object.keys(skillExercises).sort()).toEqual(['examples', 'exercises'])
				expect(isExerciseContainer(skillExercises.examples)).toBe(true)
				expect(isExerciseContainer(skillExercises.exercises)).toBe(true)
			})

			// Ensure that all given exercises are actual exercises.
			const validSkillExercises = isPlainObject(skillExercises) ? skillExercises : undefined
			if (!validSkillExercises) return
			for (const containerName of ['examples', 'exercises'] as const) {
				const container = validSkillExercises[containerName]
				if (!isPlainObject(container)) continue
				for (const [exerciseId, exercise] of Object.entries(container)) {
					it(`${containerName}.${exerciseId} satisfies the exercise format`, () => {
						expect(isExercise(exercise)).toBe(true)
					})
				}
			}
		})
	}
})
