const { expressionSubtypes, expressionComparisons } = require('.')

const { Variable, Integer } = expressionSubtypes
const { exactEqual, onlyOrderChanges, onlyElementaryClean, equivalent, integerMultiple, constantMultiple } = expressionComparisons

const x = new Variable('x')
const y = new Variable('y')
const z = new Variable('z')

/*
 * Expression methods: all expression subtypes must have a variety of methods implemented.
 */

const obligatoryMethods = ['become', 'isSubtype', 'toString', 'toRawTex', 'requiresBracketsFor', 'requiresPlusInSum', 'dependsOn', 'isNumeric', 'toNumber', 'hasFloat', 'verifyVariable', 'getVariables', 'getVariableStrings', 'substitute', 'substituteBasic', 'getDerivative', 'getDerivativeBasic', 'simplify', 'simplifyBasic', 'equals', 'equalsBasic']
describe('Check all expression types:', () => {
	Object.keys(expressionSubtypes).forEach(type => {
		describe(type, () => {
			const ExpressionType = expressionSubtypes[type]
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
})

/*
 * Direct comparison: the equals function must properly recognize equal expressions and distinguish non-equal expressions.
 */

describe('Check direct expression comparison:', () => {
	describe('variables', () => {
		const x = new Variable('x')
		const y = new Variable('y')
		const xdot = new Variable('dot(x)')
		it('equal itself', () => {
			expect(x.equals(x, false)).toBe(true)
		})
		it('do not equal other variables', () => {
			expect(x.equals(y)).toBe(false)
			expect(x.equals(xdot)).toBe(false)
		})
	})

	describe('integers', () => {
		it('equal itself', () => {
			expect(Integer.one.equals(Integer.one)).toBe(true)
			expect(Integer.two.equals(Integer.two)).toBe(true)
		})
		it('do not equal other integers', () => {
			expect(Integer.one.equals(Integer.two)).toBe(false)
			expect(Integer.two.equals(Integer.one)).toBe(false)
		})
	})

	describe('sums', () => {
		it('equal itself', () => {
			expect(x.add(y).equals(x.add(y))).toBe(true)
		})
		it('deal properly with addition priority', () => {
			expect(x.add(y).add(z).equals(x.add(y.add(z)))).toBe(true)
		})
		it('deal properly with order changes', () => {
			expect(x.add(y).equals(y.add(x), true)).toBe(true)
			expect(x.add(y).equals(y.add(x), false)).toBe(false)
		})
		it('do not equal other sums', () => {
			expect(x.add(y).equals(x.add(z))).toBe(false)
		})
	})

	describe('products', () => {
		it('equal itself', () => {
			expect(x.multiply(y).equals(x.multiply(y))).toBe(true)
		})
		it('deal properly with multiplication priority', () => {
			expect(x.multiply(y).multiply(z).equals(x.multiply(y.multiply(z)))).toBe(true)
		})
		it('deal properly with order changes', () => {
			expect(x.multiply(y).equals(y.multiply(x), true)).toBe(true)
			expect(x.multiply(y).equals(y.multiply(x), false)).toBe(false)
		})
		it('do not equal other sums', () => {
			expect(x.multiply(y).equals(x.multiply(z))).toBe(false)
		})
	})
})

/*
 * Simplification: the simplification functions must properly simplify expressions.
 */

describe('Check expression simplification:', () => {
	describe('remove useless', () => {
		it('removes useless additions', () => {
			const xPlusZero = x.add(Integer.zero)
			expect(xPlusZero.equals(x)).toBe(false)
			expect(xPlusZero.removeUseless().equals(x)).toBe(true)
		})
		it('removes useless multiplications', () => {
			const xTimesOne = x.multiply(Integer.one)
			expect(xTimesOne.equals(x)).toBe(false)
			expect(xTimesOne.removeUseless().equals(x)).toBe(true)
		})
	})

	describe('elementary clean', () => {
		it('merges fraction products', () => {
			const exp1 = Integer.two.divide(Integer.three).multiply(x)
			const exp2 = Integer.two.multiply(x).divide(Integer.three)
			expect(exp1.equals(exp2)).toBe(false)
			expect(exp1.elementaryClean().equals(exp2)).toBe(true)
		})
		it('merges minus one product numbers', () => {
			const product = Integer.minusOne.multiply(Integer.three)
			const minusThree = new Integer(-3)
			expect(product.equals(minusThree)).toBe(false)
			expect(product.elementaryClean().equals(minusThree)).toBe(true)
		})
		it('merges product numbers into fractions', () => {
			const exp1 = Integer.minusOne.multiply(Integer.two).divide(Integer.three)
			const exp2 = Integer.minusOne.multiply(Integer.two.divide(Integer.three))
			expect(exp1.equals(exp2)).toBe(false)
			expect(exp1.elementaryClean().equals(exp2.elementaryClean())).toBe(true)
		})
	})

	// ToDo later: add extra tests for the other cleaning methods too.
})

/*
 * Comparison: the equivalence functions and similar must work properly.
 */

describe('Check expression comparison: ', () => {
	describe('exactEqual', () => {
		it('matches equal expressions', () => {
			expect(exactEqual(x.add(y), x.add(y))).toBe(true) // x + y = x + y
		})
		it('distinguishes unequal expressions', () => {
			expect(exactEqual(x.add(y), y.add(x))).toBe(false) // x + y = y + x
		})
	})

	describe('onlyOrderChanges', () => {
		it('matches equal expressions', () => {
			expect(onlyOrderChanges(x.add(y), y.add(x))).toBe(true) // x + y = y + x
		})
		it('distinguishes unequal expressions', () => {
			expect(onlyOrderChanges(Integer.two.multiply(Integer.three).divide(Integer.four), Integer.two.multiply(Integer.three.divide(Integer.four)))).toBe(false) // (2*3)/4 = 2*(3/4)
		})
	})

	describe('onlyElementaryClean', () => {
		it('matches equal expressions', () => {
			expect(onlyElementaryClean(Integer.two.multiply(Integer.three).divide(Integer.four), Integer.two.multiply(Integer.three.divide(Integer.four)))).toBe(true) // (2*3)/4 = 2*(3/4)
		})
		it('distinguishes unequal expressions', () => {
			expect(onlyElementaryClean(Integer.two.multiply(x.add(y)), Integer.two.multiply(x).add(Integer.two.multiply(y)))).toBe(false) // 2(x+y) = 2x+2y
		})
	})

	describe('equivalent', () => {
		it('matches equal expressions', () => {
			expect(equivalent(Integer.two.multiply(x.add(y)), Integer.two.multiply(x).add(Integer.two.multiply(y)))).toBe(true) // 2(x+y) = 2x+2y
		})
		it('distinguishes unequal expressions', () => {
			expect(equivalent(Integer.six.multiply(x), Integer.three.multiply(x))).toBe(false) // 6x = 3x
		})
	})

	describe('integerMultiple', () => {
		it('matches equal expressions', () => {
			expect(integerMultiple(Integer.six.multiply(x), Integer.three.multiply(x))).toBe(true) // 6x = 3x
		})
		it('distinguishes unequal expressions', () => {
			expect(integerMultiple(Integer.five.multiply(x), Integer.three.multiply(x))).toBe(false) // 5x = 3x
		})
	})

	describe('constantMultiple', () => {
		it('matches equal expressions', () => {
			expect(constantMultiple(Integer.six.multiply(x), Integer.three.multiply(x))).toBe(true) // 5x = 3x
		})
		it('distinguishes unequal expressions', () => {
			expect(constantMultiple(Integer.five.multiply(x), Integer.three.multiply(y))).toBe(false) // 5x = 3y
		})
	})
})
