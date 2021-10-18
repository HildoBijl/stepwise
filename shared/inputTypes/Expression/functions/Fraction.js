const { gcd } = require('../../../util/numbers')

const Expression = require('../abstracts/Expression')
const Parent = require('../abstracts/FunctionMultiArgument')
const Integer = require('../Integer')
const Sum = require('../Sum')
const Product = require('../Product')
const Power = require('./Power')

const args = ['numerator', 'denominator']

class Fraction extends Parent {
	toNumber() {
		return this.numerator.toNumber() / this.denominator.toNumber()
	}

	toString() {
		// Get the numerator.
		let numStr = this.numerator.toString()
		if (this.numerator.requiresBracketsFor(Expression.bracketLevels.multiplication))
			numStr = `(${numStr})`

		// Add the denominator.
		let denStr = this.denominator.toString()
		if (this.denominator.requiresBracketsFor(Expression.bracketLevels.division))
			denStr = `(${denStr})`

		// Put them together.
		return `${numStr}/${denStr}`
	}

	toTex() {
		return `\\frac{${this.numerator.tex}}{${this.denominator.tex}}`
	}

	requiresBracketsFor(level) {
		return level === Expression.bracketLevels.division || level === Expression.bracketLevels.powers
	}

	multiplyNumDenBy(expression) {
		expression = Expression.ensureExpression(expression)
		return new Fraction(this.numerator.multiplyBy(expression), this.denominator.multiplyBy(expression))
	}

	getDerivativeBasic(variable) {
		const terms = []

		// If the numerator depends on the variable, take its derivative.
		if (this.numerator.dependsOn(variable)) {
			terms.push(new Fraction(
				this.numerator.getDerivative(variable),
				this.denominator,
			))
		}

		// If the denominator depends on the variable, take that derivative too.
		if (this.denominator.dependsOn(variable)) {
			terms.push(new Fraction(
				new Product( // The numerator is f*g'.
					this.numerator,
					this.denominator.getDerivative(variable),
				),
				new Power( // The denominator is g^2.
					this.denominator,
					2,
				),
			).applyMinus()) // Apply the minus.
		}

		// Return the outcome.
		return new Sum(...terms).simplify(Expression.simplifyOptions.removeUseless)
	}

	simplifyBasic(options) {
		let { numerator, denominator } = this.simplifyChildren(options)

		// Flatten fractions inside fractions.
		if (options.flattenFractions) {
			if (numerator.isType(Fraction)) {
				if (denominator.isType(Fraction)) { // (a/b)/(c/d) => (ad)/(bc)
					const oldDenominator = denominator
					denominator = new Product([numerator.denominator, denominator.numerator]).simplifyBasic(options)
					numerator = new Product([numerator.numerator, oldDenominator.denominator]).simplifyBasic(options)
				} else { // (a/b)/c => a/(bc)
					denominator = new Product([numerator.denominator, denominator]).simplifyBasic(options)
					numerator = numerator.numerator
				}
			} else if (denominator.isType(Fraction)) { // a/(b/c) => (ac)/b
				numerator = new Product([numerator, denominator.denominator]).simplifyBasic(options)
				denominator = denominator.numerator
			}
		}

		// Split up fractions having numerator sums.
		if (options.splitFractions) {
			if (numerator.isType(Sum)) {
				return new Sum(numerator.terms.map(term => new Fraction(term, denominator))).simplify(options)
			}
		}

		// Reduce the numbers in the fraction.
		if (options.mergeNumbers && options.reduceFractionNumbers) {
			// Only do this for fractions of products now. No support for sums (2x+2y)/2 or powers (2x)^2/2 is present.

			// Get the numbers preceding the numerator and denominator.
			const extractNumber = (term) => {
				if (term.isType(Integer))
					return term.number
				if (term.isType(Product))
					return extractNumber(term.terms[0])
				return 1
			}
			const numeratorNumber = extractNumber(numerator)
			const denominatorNumber = extractNumber(denominator)

			// Calculate the divisor.
			let divisor = gcd(numeratorNumber, denominatorNumber)

			// Check special cases.
			if (divisor === 1) {
				if (denominatorNumber < 0) {
					numerator = numerator.applyMinus()
					denominator = denominator.applyMinus()
				}
			} else {
				// Ensure that the denominator has a positive number.
				if (denominatorNumber < 0)
					divisor = -divisor

				// Divide elements by the divisor.
				const divideByDivisor = (term) => {
					if (term.isType(Integer))
						return new Integer(term.number / divisor)
					if (term.isType(Product))
						return term.applyToElement(0, divideByDivisor)
					throw new Error(`Fraction reduction error: an unexpected case appeared while reducing the numbers inside a fraction.`)
				}
				numerator = divideByDivisor(numerator)
				denominator = divideByDivisor(denominator)
			}

			// ToDo: expand this to more generic cases, involving sums, powers, etcetera.
		}

		// Merge fraction terms.
		if (options.mergeFractionTerms) {
			// Set up a terms list of all factors in the numerator and denominators. For denominator factors, add a power of -1 (invert them).
			let terms = []
			let numeratorTerms = numerator.isType(Product) ? numerator.terms : [numerator]
			let denominatorTerms = denominator.isType(Product) ? denominator.terms : [denominator]
			numeratorTerms.forEach(term => terms.push(term))
			denominatorTerms.forEach(term => terms.push(term.invert()))

			// Merge the list of terms, just like for a product.
			terms = Product.mergeProductTerms(terms, options)

			// Check which factors should be in the numerator and which in the denominator, based on their exponent, and reassemble both.
			numeratorTerms = []
			denominatorTerms = []
			terms.forEach(term => {
				if (term.isType(Power) && term.exponent.isNegative())
					denominatorTerms.push(term.invert())
				else
					numeratorTerms.push(term)
			})
			numerator = new Product(numeratorTerms).simplify(Expression.simplifyOptions.removeUseless)
			denominator = new Product(denominatorTerms).simplify(Expression.simplifyOptions.removeUseless)
		}

		// Check for useless elements.
		if (options.removeUseless) {
			// On a zero numerator, ignore the denominator.
			if (numerator.equalsBasic(Integer.zero))
				return Integer.zero

			// On a one denominator, return the numerator.
			if (denominator.equalsBasic(Integer.one))
				return numerator

			// On a minus one denominator, return minus te numerator.
			if (denominator.equalsBasic(Integer.minusOne))
				return numerator.applyMinus()
		}

		return new Fraction({ numerator, denominator })
	}

	// ToDo: equals.
}
Fraction.defaultSO = Parent.getDefaultSO(args)
Fraction.args = args
Fraction.type = 'Fraction'
module.exports = Fraction