const Parent = require('../abstracts/FunctionMultiArgument')
const Fraction = require('./Fraction')
const Power = require('./Power')

const args = ['base', 'argument']

class Root extends Parent {
	toNumber() {
		return Math.pow(this.argument.toNumber(), 1/this.base.toNumber())
	}

	toTex() {
		return this.addFactorToTex(`\\sqrt[${this.base.tex}]{${this.argument.tex}}`)
	}

	getDerivativeBasic(variable) {
		return this.simplify({ forDerivatives: true }).getDerivativeBasic(variable) // ToDo: add level/options.
	}

	simplify(options) {
		// ToDo: check level.

		if (options.forDerivatives)
			return new Power(this.argument, new Fraction(1, this.base)).multiplyBy(this.factor).simplify(options)

		return this
	}

	// ToDo: equals.
}
Root.defaultSO = Parent.getDefaultSO(args)
Root.args = args
module.exports = Root