const { SingleArgumentFunction, Integer, Sum, Product, Fraction, Power } = require('../Expression')
const { Sqrt } = require('./roots')

/*
 * Sine
 */

class Sin extends SingleArgumentFunction {
	toNumber() {
		return Math.sin(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Product(
			new Cos(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		)
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			if (argument.equalsBasic(Integer.zero))
				return Integer.zero
		}

		return new Sin(argument)
	}
}
Sin.type = 'Sin'
module.exports.Sin = Sin

/*
 * Cosine
 */

class Cos extends SingleArgumentFunction {
	toNumber() {
		return Math.cos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Product(
			Integer.minusOne,
			new Sin(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		)
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			if (argument.equalsBasic(Integer.zero))
				return Integer.one
		}

		return new Cos(argument)
	}
}
Cos.type = 'Cos'
module.exports.Cos = Cos

/*
 * Tangent
 */

class Tan extends SingleArgumentFunction {
	toNumber() {
		return Math.tan(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Power(new Cos(this.argument), Integer.two), // Use 1/cos(arg)^2.
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		if (options.toBasicForm)
			return Fraction(Sin(argument), Cos(argument)).simplify(options)

		return new Tan(argument)
	}
}
Tan.type = 'Tan'
module.exports.Tan = Tan

/*
 * Arcsine
 */

class Arcsin extends SingleArgumentFunction {
	toNumber() {
		return Math.asin(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(new Sum([Integer.one, new Power(this.argument, Integer.two).applyMinus()])), // Apply 1/sqrt(1 - arg^2).
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		return new Arcsin(argument)
	}
}
Arcsin.type = 'Arcsin'
module.exports.Arcsin = Arcsin

/*
 * Arccosine
 */

class Arccos extends SingleArgumentFunction {
	toNumber() {
		return Math.acos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable).applyMinus(), // Apply the chain rule with a minus sign.
			denominator: new Sqrt(new Sum([Integer.one, new Power(this.argument, Integer.two).applyMinus()])), // Apply 1/sqrt(1 - arg^2).
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		return new Arccos(argument)
	}
}
Arccos.type = 'Arccos'
module.exports.Arccos = Arccos

/*
 * Arctangent
 */

class Arctan extends SingleArgumentFunction {
	toNumber() {
		return Math.atan(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Fraction({
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sum([Integer.one, new Power(this.argument, Integer.two)]), // Apply 1/(1 + arg^2).
		})
	}

	simplifyBasic(options) {
		let { argument } = this.simplifyChildren(options)

		return new Arctan(argument)
	}
}
Arctan.type = 'Arctan'
module.exports.Arctan = Arctan
