import Parent from '../abstracts/FunctionSingleArgument'
import Sum from '../Sum'
import Fraction from './Fraction'
import Power from './Power'
import Sqrt from './Sqrt'

export default class Arccos extends Parent {
	toNumber() {
		return Math.acos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		// Set up 1 - arg^2.
		const inner = new Sum([
			1,
			new Power(this.argument, 2).applyMinus(),
		])

		// Set up the result.
		return new Fraction({
			factor: -this.factor, // Keep the factor, but apply the minus.
			numerator: this.argument.getDerivative(variable), // Apply the chain rule.
			denominator: new Sqrt(inner), // sqrt(1 - arg^2).
		})
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// ToDo

		return new Arccos({ factor, argument })
	}
}
Arccos.defaultSO = Parent.defaultSO
Arccos.type = 'Arccos'
