
import skills from '../skills'
import { getAllExercises } from './util/selection'
import { getDifficulty } from '../skills/util'
import { ensureCombiner, getCombinerSkills } from '../../skillTracking'

// Set up a support function to check if something is a skill combiner.
const assertSkillCombiner = (combiner) => {
	expect(combiner).not.toBe(undefined)
	expect(() => ensureCombiner(combiner)).not.toThrow()
	const combinerSkills = getCombinerSkills(combiner)
	combinerSkills.forEach(skill => {
		expect(typeof skills[skill]).toBe('object')
	})
}

// Run the tests!
describe('Check all exercises:', async () => {
	const exercises = getAllExercises()
	exercises.forEach(exerciseId => {
		describe(exerciseId, async () => {
			// Load exercise file.
			let exercise
			try {
				exercise = await import(`./exercises/${exerciseId}`)
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
					expect(steps.length).toBeGreaterThan(1)
					steps.forEach(step => {
						if (step === null)
							return // Null is always fine.
						if (Array.isArray(step)) {
							expect(step.length).toBeGreaterThan(1)
							step.forEach(substep => {
								if (substep === null)
									return // Null is always fine.
								assertSkillCombiner(substep)
							})
						} else {
							assertSkillCombiner(step)
						}
					})
				})
			}
		})
	})
})
