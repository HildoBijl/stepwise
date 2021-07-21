const Expression = require('../abstracts/Expression')
const Parent = require('../abstracts/FunctionMultiArgument')
const Sum = require('../Sum')
const Product = require('../Product')
const Power = require('./Power')

const args = ['numerator', 'denominator']

class Fraction extends Parent {
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
		return this.addFactorToString(`${numStr}/${denStr}`)
	}

	toTex() {
		return this.addFactorToTex(`\\frac{${this.numerator.tex}}{${this.denominator.tex}}`)
	}

	requiresBracketsFor(level) {
		return level === Expression.bracketLevels.division || level === Expression.bracketLevels.powers
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
			).multiplyBy(-1)) // Apply the minus.
		}

		// Return the outcome.
		return new Sum(...terms).multiplyBy(this.factor)
	}

	// ToDo: equals.
}
Fraction.defaultSO = Parent.getDefaultSO(args)
Fraction.args = args
module.exports = Fraction