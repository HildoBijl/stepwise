const Parent = require('../abstracts/FunctionMultiArgument')
const Fraction = require('./Fraction')
const Power = require('./Power')

const args = ['base', 'argument']

class Root extends Parent {
	toNumber() {
		return Math.pow(this.argument.toNumber(), 1 / this.base.toNumber())
	}

	toTex() {
		return this.addFactorToTex(`\\sqrt[${this.base.tex}]{${this.argument.tex}}`)
	}

	getDerivativeBasic(variable) {
		return this.simplify({ forDerivatives: true }).getDerivativeBasic(variable) // ToDo: add level/options.
	}

	simplifyBasic(options) {
		let { factor, base, argument } = this.simplifyChildren(options)

		// ToDo: check basic cases.

		if (options.forDerivatives)
			return new Power(argument, new Fraction(1, base)).multiplyBy(factor).simplifyBasic(options)

		return new Root({ factor, base, argument })
	}

	// ToDo: equals.
}
Root.defaultSO = Parent.getDefaultSO(args)
Root.args = args
Root.type = 'Root'
module.exports = Root