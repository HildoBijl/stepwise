const { SingleArgumentFunction, Integer, Product } = require('../Expression')

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

			// ToDo: check for basic angles. (And same for cos and tan.)
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

			// ToDo: check for basic angles. (And same for cos and tan.)
		}

		return new Cos(argument)
	}
}
Cos.type = 'Cos'
module.exports.Cos = Cos

// ToDo: add other trigonometry functions here.