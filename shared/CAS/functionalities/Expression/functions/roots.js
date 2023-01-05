const { getParentClass } = require('../../../../util/objects')
const { getLargestPowerFactor } = require('../../../../util/maths')

const { Integer, SingleArgumentFunction, Product, Function, Fraction, Power, simplifyOptions } = require('../Expression')

/*
 * Sqrt
 */

class Sqrt extends SingleArgumentFunction {
	get base() {
		return Integer.two // The square root always has base 2.
	}

	toNumber() {
		return Math.sqrt(this.argument.toNumber())
	}

	toRawTex() {
		return `\\sqrt{${this.argument.tex}}`
	}

	requiresTimesBeforeInProductTex() {
		return false
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(this.argument).multiply(2), // Put the sqrt in the denominator. Multiply by 2 because of the square root derivative rule.
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			// If the argument is zero, turn it into zero.
			if (Integer.zero.equalsBasic(argument))
				return Integer.zero

			// If the argument is 1, become 1.
			if (Integer.one.equalsBasic(argument))
				return Integer.one
		}

		// Pull factors out of roots, like turning sqrt(20) to 2*sqrt(5) and sqrt(a^3b^4c^5) to ab^2c^2*sqrt(ac).
		if (options.pullFactorsOutOfRoots) {
			// If the argument is a product, integer or power, then we can possibly pull out factors.
			let terms
			if (argument.isSubtype(Product))
				terms = argument.terms
			if (argument.isSubtype(Integer) || argument.isSubtype(Power))
				terms = [argument]

			// Gather all pulled terms.
			const power = 2
			const pulledTerms = []
			if (terms) {
				terms = terms.map(term => {
					// For an integer, pull out the largest power factor.
					if (term.isSubtype(Integer) && term.value !== 0) {
						const largestPowerFactor = getLargestPowerFactor(Math.abs(term.value), power)
						if (largestPowerFactor > 1) {
							pulledTerms.push(new Integer(largestPowerFactor ** (1 / power)))
							return new Integer(term.value / largestPowerFactor)
						}
					}

					// For a power, check if the power can be reduced.
					if (term.isSubtype(Power) && term.exponent.isSubtype(Integer) && Math.abs(term.exponent.value) >= power) {
						const remainingExponent = term.exponent.value % power
						const pulledOutExponent = (term.exponent.value - remainingExponent) / power
						pulledTerms.push(new Power(term.base, new Integer(pulledOutExponent)))
						return new Power(term.base, new Integer(remainingExponent))
					}

					// Nothing can be found. Keep the term as is.
					return term
				})
			}

			// When terms have been pulled, assemble everything.
			if (pulledTerms.length > 0) {
				pulledTerms.push(new Sqrt(new Product(terms)))
				return new Product(pulledTerms).simplifyBasic(options)
			}
		}

		// For analysis reduce to a power.
		if (options.toBasicForm)
			return new Power(argument, new Fraction(1, 2)).simplifyBasic(options)

		return new Sqrt(argument)
	}
}
Sqrt.type = 'Sqrt'
Sqrt.hasMainArgumentLast = true
Sqrt.two = new Sqrt(Integer.two)
Sqrt.three = new Sqrt(Integer.three)
Sqrt.five = new Sqrt(Integer.five)
module.exports.Sqrt = Sqrt

/*
 * Root
 */

class Root extends Function {
	toNumber() {
		return Math.pow(this.argument.toNumber(), 1 / this.base.toNumber())
	}

	toRawTex() {
		return `\\sqrt[${this.base.tex}]{${this.argument.tex}}`
	}

	requiresTimesBeforeInProductTex() {
		return false
	}

	getDerivativeBasic(variable) {
		return this.simplify(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { base, argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			// If the argument is zero, turn it into zero.
			if (Integer.zero.equalsBasic(argument))
				return Integer.zero
		}

		// For analysis reduce to a power.
		if (options.toBasicForm)
			return new Power(argument, new Fraction(1, base)).simplifyBasic(options)

		return new Root({ argument, base })
	}

	static getDefaultSO() {
		return {
			argument: Integer.one,
			base: Integer.two,
			...getParentClass(this).getDefaultSO(),
		}
	}
}
Root.type = 'Root'
Root.args = ['argument', 'base']
Root.obligatory = [true, false]
Root.hasMainArgumentLast = true
module.exports.Root = Root
