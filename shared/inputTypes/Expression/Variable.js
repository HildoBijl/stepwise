const { processOptions, filterOptions } = require('../../util/objects')

const Expression = require('./abstracts/Expression')
const Constant = require('./Constant')

const regVariableFormat = /^((([a-zA-Z]*)\[([a-zA-Z0-9α-ωΑ-Ω]+)\])|([a-zA-Z0-9α-ωΑ-Ω]+))(_((.)|\[(.*)\]))?$/

const Parent = Expression
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
		SO = this.checkAndRemoveType(SO)
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

	toString() {
		let result = this.symbol
		if (this.accent)
			result = `${this.accent}[${result}]`
		result = this.addFactorToString(result)
		if (this.subscript) {
			if (this.subscript.length > 1)
				result = `${result}_[${this.subscript}]`
			else
				result = `${result}_${this.subscript}`
		}
		return result
	}

	toTex() {
		let result = this.symbol
		if (this.accent)
			result = `\\${this.accent}{${result}}`
		result = this.addFactorToTex(result)
		if (this.subscript)
			result = `${result}_{${this.subscript}}`
		return result
	}

	requiresBracketsFor(level) {
		if (level === Expression.bracketLevels.addition || level === Expression.bracketLevels.multiplication)
			return false
		return this.factor !== 1
	}

	dependsOn(variable) {
		return this.equals(variable, { ignoreFactor: true })
	}

	getVariableStrings() {
		return new Set([this.eliminateFactor().str]) // Return a set with the string representation of this variable. The string representation allows proper set comparisons, filtering out duplicates.
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

	// isPi and isE check if this variable equals the given numbers.
	isPi() {
		return this.equals(Variable.pi, { ignoreFactor: true })
	}
	isE() {
		return this.equals(Variable.e, { ignoreFactor: true })
	}

	isNumeric() {
		return this.isPi() || this.isE()
	}

	toNumber() {
		if (this.isPi())
			return this.factor * Math.PI
		if (this.isE())
			return this.factor * Math.E
		throw new Error(`Invalid toNumber call: cannot turn the given expression into a number because it depends on the variable "${this.str}". Tip: check if the expression is numeric through exp.isNumeric() before asking for the number.`)
	}

	getDerivativeBasic(variable) {
		if (!this.equals(variable, { ignoreFactor: true }))
			return new Constant(0) // It's a different parameter.
		return new Constant(this.factor)
	}

	simplifyBasic() {
		return this // Parameter types don't get any simpler.
	}

	// equals checks if this variable equals another variable.
	equals(expression, options = {}) {
		// Compare the type and factor.
		if (!super.equals(expression, options))
			return false

		// Compare all parts.
		return parts.every(part => this[part] === expression[part])
	}

	// interpret turns a string representation of a variable into an SO representation of a variable. (No factors are allowed in this. Only symbols, subscripts and accents. Use square brackets for accents.)
	static interpret(str) {
		const match = regVariableFormat.exec(str)
		if (!match)
			throw new Error(`Variable interpretation error: tried to interpret a variable "${str}" but could not interpret this string. It should be of the form "x_2", "dot[x]", "x_[av]" or "dot[x]_[av]".`)
		return {
			symbol: match[4] || match[5],
			subscript: match[8] || match[9],
			accent: match[3],
		}
	}

	// variableSort determines the sorting order of variables. It takes two variables and returns a value larger than zero if b must be before a.
	static variableSort(a, b) {
		const comparisonOrder = ['symbol', 'subscript', 'accent', 'factor']
		const firstDifferentKey = comparisonOrder.find(key => a[key] !== b[key])
		if (firstDifferentKey)
			return (a[firstDifferentKey] || '') < (b[firstDifferentKey] || '') ? -1 : 1
		return 0 // All equal.
	}
}
Variable.defaultSO = defaultSO
Variable.type = 'Variable'
module.exports = Variable

Variable.e = new Variable('e')
Variable.pi = new Variable('π')