import Parent from '../abstracts/FunctionSingleArgument'
import Integer from '../Integer'
import Product from '../Product'
import Cos from './Cos'

export default class Sin extends Parent {
	toNumber() {
		return Math.sin(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Product(
			new Cos(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		).multiplyBy(this.factor)
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// Check for basic reductions.
		if (options.basicReductions) {
			if (argument.equalsBasic(Integer.zero))
				return Integer.zero

			// ToDo: check for basic angles. (And same for cos and tan.)
		}

		return new Sin({ factor, argument })
	}
}
Sin.defaultSO = Parent.defaultSO
Sin.type = 'Sin'
