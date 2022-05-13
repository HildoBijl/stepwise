const { SingleArgumentFunction, Function, Fraction, Power, simplifyOptions } = require('../Expression')

/*
 * Sqrt
 */

class Sqrt extends SingleArgumentFunction {
	toNumber() {
		return Math.sqrt(this.argument.toNumber())
	}

	toRawTex() {
		return `\\sqrt{${this.argument.tex}}`
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(this.argument).multiplyBy(2), // Put the sqrt in the denominator. Multiply by 2 because of the square root derivative rule.
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			// If the argument is zero, turn it into zero.
			if (Integer.zero.equalsBasic(argument))
				return Integer.zero
		}

		// For analysis reduce to a power.
		if (options.toBasicForm)
			return new Power(argument, new Fraction(1, 2)).simplifyBasic(options)

		return new Sqrt(argument)
	}
}
Sqrt.type = 'Sqrt'
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
}
Root.type = 'Root'
Root.args = ['argument', 'base']
module.exports.Root = Root
