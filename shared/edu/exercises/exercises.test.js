
const { skillTree } = require('../skills')
const { getAllExercises } = require('./util/selection')
const { getDifficulty } = require('../skills/util')
const { ensureSetup } = require('../../skillTracking')

// Set up a support function to check if something is a skill set-up.
const assertSkillSetup = (setup) => {
	expect(setup).not.toBe(undefined)
	expect(() => ensureSetup(setup)).not.toThrow()
	setup = ensureSetup(setup)
	const skillIds = setup.getSkillList()
	skillIds.forEach(skillId => {
		expect(typeof skillTree[skillId]).toBe('object')
	})
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
				assertSkillSetup(getDifficulty(exercise.data))
			})

			if (exercise.getSolution) {
				it('does not have both a getSolution and getStaticSolution function', () => {
					expect(exercise.getStaticSolution).toBe(undefined)
				})
			}

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
								assertSkillSetup(substep)
							})
						} else {
							assertSkillSetup(step)
						}
					})
				})
			}
		})
	})
})