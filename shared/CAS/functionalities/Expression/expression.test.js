const { expressionTypes } = require('.')

const obligatoryMethods = ['become', 'clone', 'isType', 'toString', 'toRawTex', 'requiresBracketsFor', 'requiresPlusInSum', 'dependsOn', 'isNumeric', 'toNumber', 'hasFloat', 'verifyVariable', 'getVariables', 'getVariableStrings', 'substitute', 'substituteBasic', 'getDerivative', 'getDerivativeBasic', 'simplify', 'simplifyBasic', 'equals', 'equalsBasic']

// Run the tests!
describe('Check all expression types:', () => {
	Object.keys(expressionTypes).forEach(type => {
		describe(type, () => {
			const ExpressionType = expressionTypes[type]
			it('exists', () => {
				expect(ExpressionType).not.toBe(undefined)
			})

			it('is a class', () => {
				expect(ExpressionType.constructor).not.toBe(undefined)
			})

			it('has a type property', () => {
				expect(typeof ExpressionType.type).toBe('string')
			})

			describe('has all required methods', () => {
				// For each obligatory method, check that it exists and is different from the one specified for any Object. (Objects for instance already have their own toString method.)
				obligatoryMethods.forEach(method => {
					it(`like "${method}"`, () => {
						expect(ExpressionType.prototype[method]).not.toBe(undefined)
						expect(ExpressionType.prototype[method]).not.toBe(Object.prototype[method])
					})
				})
			})
		})
	})

	// const exercises = getAllExercises()
	// exercises.forEach(exerciseId => {
	// 	describe(exerciseId, () => {
	// 		// Load exercise file.
	// 		let exercise
	// 		try {
	// 			exercise = require(`./exercises/${exerciseId}`)
	// 		} catch (e) {
	// 			it('has a shared file', () => fail())
	// 		}
	// 		if (!exercise)
	// 			return

	// 		// Analyse exercise file.
	// 		it('has a data object', () => {
	// 			expect(typeof exercise.data).toBe('object')
	// 		})

	// 		it('has a generateState function', () => {
	// 			expect(typeof exercise.generateState).toBe('function')
	// 		})

	// 		it('has a processAction function', () => {
	// 			expect(typeof exercise.processAction).toBe('function')
	// 		})

	// 		it('has a difficulty defined with known skills', () => {
	// 			assertSkillCombiner(getDifficulty(exercise.data))
	// 		})

	// 		if (exercise.data.steps) {
	// 			it('has steps properly defined', () => {
	// 				const { steps } = exercise.data
	// 				expect(Array.isArray(steps)).toBe(true)
	// 				expect(steps.length).toBeGreaterThan(1)
	// 				steps.forEach(step => {
	// 					if (step === null)
	// 						return // Null is always fine.
	// 					if (Array.isArray(step)) {
	// 						expect(step.length).toBeGreaterThan(1)
	// 						step.forEach(substep => {
	// 							if (substep === null)
	// 								return // Null is always fine.
	// 							assertSkillCombiner(substep)
	// 						})
	// 					} else {
	// 						assertSkillCombiner(step)
	// 					}
	// 				})
	// 			})
	// 		}
	// 	})
	// })
})