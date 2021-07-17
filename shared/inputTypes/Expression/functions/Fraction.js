const Expression = require('../abstracts/Expression')
const Parent = require('../abstracts/FunctionMultiArgument')
const Sum = require('../Sum')
const Product = require('../Product')
const Power = require('./Power')

const args = ['numerator', 'denominator']

class Fraction extends Parent {
	toString(ignoreFactor = false) {
		// Get the numerator.
		let numStr = this.numerator.toString()
		if (this.numerator.requiresBracketsFor(Expression.multiplication))
			numStr = `(${numStr})`

		// Add the denominator.
		let denStr = this.denominator.toString()
		if (this.denominator.requiresBracketsFor(Expression.division))
			denStr = `(${denStr})`

		// Put them together.
		let result = `${numStr}/${denStr}`

		// Add the factor.
		if (!ignoreFactor)
			result = this.addFactorToString(result)

		return result
	}

	requiresBracketsFor(level, ignoreFactor = false) {
		return level === Expression.division
	}

	getDerivative(variable) {
		variable = this.verifyVariable(variable)
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
		return new Sum(...terms).multiplyBy(this.factor).simplify()
	}

	// ToDo: equals.
}
Fraction.defaultSO = Parent.getDefaultSO(args)
Fraction.args = args
module.exports = Fraction