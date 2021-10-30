import { Expression, FunctionMultiArgument, Sum, Product, Power } from '../loader'

const Parent = FunctionMultiArgument

const args = ['numerator', 'denominator']

export default class Fraction extends Parent {
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
			).applyMinus()) // Apply the minus.
		}

		// Return the outcome.
		return new Sum(...terms).multiplyBy(this.factor)
	}

	simplifyBasic(options) {
		let { factor, numerator, denominator } = this.simplifyChildren(options)

		// ToDo

		return new Fraction({ factor, numerator, denominator })
	}

	// ToDo: equals.
}
Fraction.defaultSO = Parent.getDefaultSO(args)
Fraction.args = args
Fraction.type = 'Fraction'
