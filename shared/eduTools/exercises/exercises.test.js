const { isBasicObject } = require('../../util')
const { ensureSetup } = require('../../skillTracking')

const { exercises, skillTree, getExerciseName } = require('../skills')

const { getDifficulty } = require('./selection')

// Set up a support function to check if something is a skill set-up.
const assertSkillSetup = (setup) => {
	expect(setup).not.toBe(undefined)
	expect(() => ensureSetup(setup)).not.toThrow()
	setup = ensureSetup(setup)
	const skillIds = setup.getSkillList()
	skillIds.forEach(skillId => {
		expect(typeof skillId).toBe('string')
		expect(typeof skillTree[skillId]).toBe('object')
	})
}

// Run the tests!
describe('Check all exercises:', () => {
	Object.keys(exercises).forEach(exerciseId => {
		describe(exerciseId, () => {
			// Load exercise file.
			let exercise
			try {
				exercise = require(`../../eduContent/${exercises[exerciseId].path.join('/')}/${getExerciseName(exerciseId)}`)
			} catch (e) {
				it('has a shared file', () => { throw new Error(`Shared file for exercise ${exerciseId} failed to load.`) })
			}
			if (!exercise)
				return

			// Analyse exercise file.
			it('has a metaData object', () => {
				expect(typeof exercise.metaData).toBe('object')
			})

			it('has a generateState function that runs and gives a basic object', () => {
				expect(typeof exercise.generateState).toBe('function')
				expect(exercise.generateState).not.toThrow()
				expect(isBasicObject(exercise.generateState())).toBe(true)
			})

			it('has a processAction function', () => {
				expect(typeof exercise.processAction).toBe('function')
			})

			it('has a difficulty defined with known skills', () => {
				assertSkillSetup(getDifficulty(exercise.metaData))
			})

			if (exercise.getSolution) {
				it('does not have both a getSolution and getStaticSolution function', () => {
					expect(exercise.getStaticSolution).toBe(undefined)
				})
			}

			if (exercise.metaData.steps) {
				it('has steps properly defined', () => {
					const { steps } = exercise.metaData
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
				it('has a set-up', () => {
					if (exercise.metaData.steps.every(step => !!step)) // If all steps are defined, some set-up would be needed.
						expect(exercise.metaData.setup).toBeDefined()
				})
			}
		})
	})
})
