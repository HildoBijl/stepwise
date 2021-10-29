import Parent from '../abstracts/FunctionSingleArgument'
import Fraction from './Fraction'

export default class Ln extends Parent {
	toNumber() {
		return Math.log(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		const arg = this.argument.eliminateFactor() // The factor has no influence on the derivative of the ln.
		return new Fraction({
			factor: this.factor,
			numerator: arg.getDerivative(variable), // Take the derivative according to the chain rule.
			denominator: arg, // Take 1/argument according to the derivative of ln(x).
		})
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// ToDo

		return new Ln({ factor, argument })
	}
}
Ln.defaultSO = Parent.defaultSO
Ln.args = Parent.args
Ln.type = 'Ln'
