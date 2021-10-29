import Parent from '../abstracts/FunctionMultiArgument'
import Expression from '../abstracts/Expression'
import Fraction from './Fraction'
import Ln from './Ln'

const args = ['base', 'argument']

export default class Log extends Parent {
	toNumber() {
		return Math.log(this.argument.toNumber()) / Math.log(this.base.toNumber())
	}

	toTex() {
		return this.addFactorToTex(`{^{${this.base.tex}}}\\!\\log\\left(${this.argument.tex}\\right)`)
	}

	getDerivativeBasic(variable) {
		return this.simplify(Expression.simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { factor, base, argument } = this.simplifyChildren(options)

		// ToDo: check basic cases.

		if (options.forDerivatives)
			return new Fraction(new Ln(argument), new Ln(base)).multiplyBy(factor).simplifyBasic(options)

		return new Log({ factor, base, argument })
	}

	// ToDo: equals.
}
Log.defaultSO = Parent.getDefaultSO(args)
Log.args = args
Log.type = 'Log'
