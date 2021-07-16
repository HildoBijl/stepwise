const { processOptions, filterOptions } = require('../../util/objects')

const Parent = require('./Expression')
const Constant = require('./Constant')

const regVariableFormat = /^((([a-zA-Z]*)\(([a-zA-Z0-9α-ωΑ-Ω]+)\))|([a-zA-Z0-9α-ωΑ-Ω]+))(_((.)|\[(.*)\]))?$/

const defaultSO = {
	...Parent.defaultSO,
	symbol: 'x',
	subscript: undefined,
	accent: undefined,
}
const parts = ['symbol', 'subscript', 'accent']

class Variable extends Parent {
	constructor(SO) {
		if (typeof SO === 'string')
			SO = Variable.interpret(SO)
		super(SO)
	}

	become(SO) {
		// Check own input.
		SO = processOptions(SO, defaultSO)
		parts.forEach(part => {
			if (typeof SO[part] !== 'string' && typeof SO[part] !== typeof defaultSO[part])
				throw new Error(`Invalid variable ${part}: the ${part} must be a string but received "${SO[part]}".`)
		})
		if (SO.symbol.length === 0)
			throw new Error(`Invalid variable symbol: the symbol must be a non-empty string.`)

		// Handle parent input.
		super.become(filterOptions(SO, Parent.defaultSO))

		// Apply own input.
		parts.forEach(part => {
			this[part] = SO[part]
		})
	}

	toString(ignoreFactor = false) {
		let result = this.symbol
		if (this.accent)
			result = `${this.accent}(${result})`
		if (!ignoreFactor)
			result = this.addFactorToString(result)
		if (this.subscript) {
			if (this.subscript.length > 1)
				result = `${result}_[${this.subscript}]`
			else
				result = `${result}_${this.subscript}`
		}
		return result
	}

	dependsOn(variable) {
		return this.equals(variable, { ignoreFactor: true })
	}

	getVariables() {
		return [this.eliminateFactor()]
	}

	substitute(variable, substitution) {
		// Check input.
		if (!(variable instanceof Variable))
			throw new TypeError(`Invalid substitution: when substituting, the given "variable" must be a variable object. The current given variable was "${variable}".`)
		if (!(substitution instanceof Component))
			throw new TypeError(`Invalid substitution: when substituting, a Component should be given to substitute with. Instead, the substitution given was "${substitution}".`)

		// Check variable name and apply substitution.
		if (!this.equals(variable, { ignoreFactor: true }))
			return this // It's a different parameter. No change takes place.
		return substitution.multiplyByNumber(this.factor) // Replace this parameter by a clone of the substitution, multiplied by the current parameter's factor.
	}

	simplify() {
		return this // Parameter types don't get any simpler.
	}

	equals(expression, options = {}) {
		if (!super.equals(expression, options))
			return false
		return parts.every(part => this[part] === expression[part])
	}

	getDerivative(variable) {
		variable = this.verifyVariable(variable)
		if (!this.equals(variable, { ignoreFactor: true }))
			return new Constant(0) // It's a different parameter.
		return new Constant(this.factor/variable.factor)
	}

	static interpret(str) {
		const match = regVariableFormat.exec(str)
		if (!match)
			throw new Error(`Variable interpretation error: tried to interpret a variable "${str}" but could not interpret this string. It should be of the form "x_2", "dot(x)", "x_[av]" or "dot(x)_[av]".`)
		return {
			symbol: match[4] || match[5],
			subscript: match[8] || match[9],
			accent: match[3],
		}
	}
}
Variable.defaultSO = defaultSO
module.exports = Variable