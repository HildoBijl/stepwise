const { Integer, Function, Fraction, Ln, simplifyOptions } = require('../Expression')

/*
 * Log
 */

class Log extends Function {
	toNumber() {
		return Math.log(this.argument.toNumber()) / Math.log(this.base.toNumber())
	}

	toRawTex() {
		return `{^{${this.base.tex}}}\\!\\log\\left(${this.argument.tex}\\right)`
	}

	getDerivativeBasic(variable) {
		return this.simplify(simplifyOptions.forDerivatives).getDerivativeBasic(variable)
	}

	simplifyBasic(options) {
		let { base, argument } = this.simplifyChildren(options)
		
		if (options.toBasicForm)
			return new Fraction(new Ln(argument), new Ln(base)).simplifyBasic(options)

		return new Log({ base, argument })
	}

	static getDefaultSO() {
		return {
			argument: Integer.one,
			base: Integer.ten,
		}
	}
}
Log.type = 'Log'
Log.args = ['argument', 'base']
module.exports.Log = Log
