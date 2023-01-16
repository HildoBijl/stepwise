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
		it('removes useless powers', () => {
			const xToPowerOne = x.toPower(Integer.one)
			expect(xToPowerOne.equals(x)).toBe(false)
			expect(xToPowerOne.removeUseless().equals(x)).toBe(true)
		})
	})

	describe('basic clean', () => {
		it('cancels sum terms', () => {
			const sum = x.multiply(Integer.three).add(Integer.five).subtract(x.multiply(Integer.three))
			const result = Integer.five
			expect(sum.equals(result)).toBe(false)
			expect(sum.basicClean().equals(result)).toBe(true)
		})
		it('flattens fractions', () => {
			const fraction = x.divide(Integer.four).divide(y.divide(Integer.five))
			const result = x.multiply(Integer.five).divide(y.multiply(Integer.four))
			expect(fraction.equals(result)).toBe(false)
			expect(fraction.basicClean().equals(result)).toBe(true)
		})
		it('merges product terms', () => {
			const product = x.multiply(Integer.three).multiply(x.toPower(Integer.two))
			const result = Integer.three.multiply(x.toPower(Integer.three))
			expect(product.equals(result)).toBe(false)
			expect(product.basicClean().equals(result)).toBe(true)
		})
	})

	describe('regular clean', () => {
		it('groups sum terms', () => {
			const sum = x.multiply(Integer.three).add(Integer.five).subtract(x.multiply(Integer.seven))
			const result = Integer.five.subtract(x.multiply(Integer.four))
			expect(sum.equals(result)).toBe(false)
			expect(sum.regularClean().equals(result)).toBe(true)
		})
		it('crosses out fractions terms', () => {
			const numerator = x.add(Integer.one).toPower(Integer.four).multiply(x.toPower(Integer.two)) // (x+1)^4*x^2
			const denominator = x.add(Integer.one).toPower(Integer.three).multiply(x.toPower(Integer.five)) // (x+1)^3*x^5
			const fraction = numerator.divide(denominator)
			const result = x.add(Integer.one).divide(x.toPower(Integer.three)) // (x+1)/x^3
			expect(fraction.equals(result)).toBe(false)
			expect(fraction.regularClean().equals(result)).toBe(true)
		})
		it('merges fraction sums', () => {
			const sum = x.divide(Integer.two).add(Integer.three.divide(y)) // x/2 + 3/y
			const result = x.multiply(y).add(Integer.six).divide(y.multiply(Integer.two)) // (xy + 6)/(2y)
			expect(sum.equals(result)).toBe(false)
			expect(sum.regularClean().equals(result)).toBe(true)
		})
	})

	describe('advanced clean', () => {
		it('expands powers of products', () => {
			const power = x.multiply(Integer.two).toPower(Integer.three)
			const result = Integer.eight.multiply(x.toPower(Integer.three))
			expect(power.equals(result)).toBe(false)
			expect(power.advancedClean().equals(result)).toBe(true)
		})
		it('expands powers of sums within sums', () => {
			const sum1 = x.add(Integer.one).multiply(x).subtract(x.subtract(Integer.one).multiply(x)) // (x+1)*x- (x-1)*x
			const result1 = Integer.two.multiply(x)
			expect(sum1.equals(result1)).toBe(false)
			expect(sum1.advancedClean().equals(result1)).toBe(true)
			const sum2 = x.add(Integer.one).multiply(x)
			const result2 = x.toPower(Integer.two).add(x)
			expect(sum2.advancedClean().equals(result2)).toBe(false) // A product outside of a sum should not be expanded.
		})
		it('pulls out common sum factors', () => {
			const term1 = x.toPower(Integer.five).multiply(x.add(Integer.one)).multiply(y) // x^5*(x+1)*y
			const term2 = x.toPower(Integer.three).multiply(x.add(Integer.one).toPower(Integer.three)).multiply(z) // x^3*(x+1)^3*z
			const sum = term1.add(term2)
			const gcd = x.toPower(Integer.three).multiply(x.add(Integer.one)) // x^3*(x+1)
			const result = gcd.multiply(x.toPower(Integer.two).multiply(y).add(x.add(Integer.one).toPower(Integer.two).multiply(z)))
			expect(sum.equals(result)).toBe(false)
			expect(sum.advancedClean().equals(result)).toBe(true)
		})
		it('applies polynomial cancellation', () => {
			const p1 = x.toPower(Integer.two).add(Integer.three.multiply(x)).add(Integer.two) // x^2+3x+2
			const p2 = x.toPower(Integer.two).add(Integer.five.multiply(x)).add(Integer.six) // x^2+5x+6
			const fraction = p1.divide(p2)
			const result = x.add(Integer.one).divide(x.add(Integer.three))
			expect(fraction.equals(result)).toBe(false)
			expect(fraction.advancedClean().equals(result)).toBe(true)
		})
	})

	describe('clean for analysis', () => {
		it('expands powers of sums', () => {
			const power = x.add(Integer.two).toPower(Integer.three) // (x+2)^3
			const result = x.toPower(Integer.three).add(x.toPower(Integer.two).multiply(Integer.six)).add(x.multiply(Integer.twelve)).add(Integer.eight) // x^3+6x^2+12x+8
			expect(power.equals(result)).toBe(false)
			expect(power.cleanForAnalysis().equals(result)).toBe(true)
		})
	})
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
