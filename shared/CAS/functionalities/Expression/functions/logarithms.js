const { Function, Fraction, Ln, simplifyOptions } = require('../Expression')

/*
 * Log
 */

class Log extends Function {
	toNumber() {
		return Math.log(this.argument.toNumber()) / Math.log(this.base.toNumber())
	}

	toTex() {
		return this.addFactorToTex(`{^{${this.base.tex}}}\\!\\log\\left(${this.argument.tex}\\right)`)
	}

	getDerivativeBasic(variable) {
		return this.simplify(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { base, argument } = this.simplifyChildren(options)
		console.log(this.str)
		console.log(this.argument)
		console.log(this.argument.str)
		console.log(this.argument.simplify(options).str)
		console.log(base.str)
		console.log(argument.str)

		console.log(new Fraction(new Ln(argument), new Ln(base)).str)
		console.log(new Fraction(new Ln(argument), new Ln(base)).simplifyBasic(options).str)
		if (options.forDerivatives)
			return new Fraction(new Ln(argument), new Ln(base)).simplifyBasic(options)

		return new Log({ base, argument })
	}
}
Log.type = 'Log'
Log.args = ['base', 'argument']
module.exports.Log = Log
