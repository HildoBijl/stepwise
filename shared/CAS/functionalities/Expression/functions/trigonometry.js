const { Variable, SingleArgumentFunction, Integer, Sum, Product, Fraction, Power } = require('../Expression')
const { Sqrt } = require('./roots')

const halfPi = Variable.pi.divideBy(2)
const twoPi = Variable.pi.multiplyBy(2)

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
			// Check for cases of 0, 1 or -1.
			if (argument.isNumeric()) {
				if (argument.divideBy(Variable.pi).cleanForAnalysis().isSubtype(Integer))
					return Integer.zero
				if (argument.subtract(halfPi).divideBy(twoPi).cleanForAnalysis().isSubtype(Integer))
					return Integer.one
				if (argument.add(halfPi).divideBy(twoPi).cleanForAnalysis().isSubtype(Integer))
					return Integer.one
			}
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

		// For analysis, reduce to a sine with a phase shift.
		if (options.forAnalysis)
			return new Sin(argument.add(halfPi)).simplifyBasic(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			// Check for cases of 0, 1 or -1.
			if (argument.isNumeric()) {
				if (argument.add(halfPi).divideBy(Variable.pi).cleanForAnalysis().isSubtype(Integer))
					return Integer.zero
				if (argument.divideBy(twoPi).cleanForAnalysis().isSubtype(Integer))
					return Integer.one
				if (argument.add(Variable.pi).divideBy(twoPi).cleanForAnalysis().isSubtype(Integer))
					return Integer.one
			}
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

		// For analysis reduce to sines and cosines.
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
