const { SingleArgumentFunction, Function, Fraction, Power, simplifyOptions } = require('../Expression')

/*
 * Sqrt
 */

class Sqrt extends SingleArgumentFunction {
	toNumber() {
		return Math.sqrt(this.argument.toNumber())
	}

	toTex() {
		return `\\sqrt{${this.argument.tex}}`
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			factor: this.factor, // Keep the factor.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(this.argument).multiplyBy(2), // Put the sqrt in the denominator. Multiply by 2 because of the square root derivative rule.
		})
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)
		return new Sqrt({ factor, argument })
	}
}
Sqrt.type = 'Sqrt'
module.exports.Sqrt = Sqrt

/*
 * Cosine
 */

class Root extends Function {
	toNumber() {
		return Math.pow(this.argument.toNumber(), 1 / this.base.toNumber())
	}

	toTex() {
		return `\\sqrt[${this.base.tex}]{${this.argument.tex}}`
	}

	getDerivativeBasic(variable) {
		return this.simplify(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { base, argument } = this.simplifyChildren(options)

		if (options.forDerivatives)
			return new Power(argument, new Fraction(1, base)).simplifyBasic(options)

		return new Root({ base, argument })
	}
}
Root.type = 'Root'
Root.args = ['argument', 'base']
module.exports.Root = Root
