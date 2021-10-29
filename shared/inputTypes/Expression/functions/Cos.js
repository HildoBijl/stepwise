import Parent from '../abstracts/FunctionSingleArgument'
import Product from '../Product'
import Sin from './Sin'

export default class Cos extends Parent {
	toNumber() {
		return Math.cos(this.argument.toNumber())
	}

	getDerivativeBasic(variable) {
		return new Product(
			new Sin(this.argument),
			this.argument.getDerivative(variable), // Apply the chain rule.
		).multiplyBy(-this.factor) // Include a minus here.
	}

	simplifyBasic(options) {
		let { factor, argument } = this.simplifyChildren(options)

		// ToDo

		return new Cos({ factor, argument })
	}
}
Cos.defaultSO = Parent.defaultSO
Cos.type = 'Cos'
