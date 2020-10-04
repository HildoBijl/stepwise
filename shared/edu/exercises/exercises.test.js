
const skills = require('../skills')
const { getAllExercises } = require('./util/selection')
const { getDifficulty } = require('../skills/util')
const { ensureCombiner, getCombinerSkills } = require('../../skillTracking')

// Set up a support function to check if something is a skill combiner.
const assertSkillCombiner = (combiner) => {
	expect(combiner).not.toBe(undefined)
	expect(() => ensureCombiner(combiner)).not.toThrow()
	const combinerSkills = getCombinerSkills(combiner)
	combinerSkills.forEach(skill => {
		expect(typeof skills[skill]).toBe('object')
	})
}

// Filter the null values out of an array. Apply recursively to subarrays.
const filterNull = (arr) => {
	arr = arr.map(item => (Array.isArray(item) ? filterNull(item) : item)) // Recursively apply to sub-arrays.
	arr = arr.filter(item => Array.isArray(item) ? item.length > 0 : item !== null) // Keep non-empty arrays and non-null non-array items.
	return arr
}

// Run the tests!
describe('Check all exercises:', () => {
	const exercises = getAllExercises()
	exercises.forEach(exerciseId => {
		describe(exerciseId, () => {
			// Load exercise file.
			let exercise
			try {
				exercise = require(`./exercises/${exerciseId}`)
			} catch (e) {
				it('has a shared file', () => fail())
			}
			if (!exercise)
				return

			// Analyse exercise file.
			it('has a data object', () => {
				expect(typeof exercise.data).toBe('object')
			})

			it('has a generateState function', () => {
				expect(typeof exercise.generateState).toBe('function')
			})

			it('has a processAction function', () => {
				expect(typeof exercise.processAction).toBe('function')
			})

			it('has a difficulty defined with known skills', () => {
				assertSkillCombiner(getDifficulty(exercise.data))
			})

			if (exercise.data.steps) {
				it('has steps properly defined', () => {
					const { steps } = exercise.data
					expect(Array.isArray(steps)).toBe(true)
					const stepsFiltered = filterNull(steps)
					expect(stepsFiltered.length).toBeGreaterThan(0)
					stepsFiltered.forEach(step => {
						if (Array.isArray(step)) {
							step.forEach(substep => assertSkillCombiner(substep))
						} else {
							assertSkillCombiner(step)
						}
					})
				})
			}
		})
	})
})