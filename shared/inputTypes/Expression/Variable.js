const { processOptions, filterOptions } = require('../../util/objects')

const Expression = require('./abstracts/Expression')
const Integer = require('./Integer')

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
		return this.equals(variable)
	}

	getVariableStrings() {
		return new Set([this.eliminateFactor().str]) // Return a set with the string representation of this variable. The string representation allows proper set comparisons, filtering out duplicates.
	}

	substituteBasic(variable, substitution) {
		if (!this.equals(variable))
			return this // It's a different parameter. No change takes place.
		return substitution
	}

	// isPi and isE check if this variable equals the given numbers.
	isPi() {
		return this.equals(Variable.pi)
	}
	isE() {
		return this.equals(Variable.e)
	}

	isNumeric() {
		return this.isPi() || this.isE()
	}

	toNumber() {
		if (this.isPi())
			return Math.PI
		if (this.isE())
			return Math.E
		throw new Error(`Invalid toNumber call: cannot turn the given expression into a number because it depends on the variable "${this.str}". Tip: check if the expression is numeric through exp.isNumeric() before asking for the number.`)
	}

	hasFloat() {
		return false
	}

	getDerivativeBasic(variable) {
		return this.equals(variable) ? Integer.one : Integer.zero
	}

	simplifyBasic() {
		return this // Parameter types don't get any simpler.
	}

	equalsBasic(expression, level) {
		// Check that the expression is a variable.
		if (!(expression instanceof Variable))
			return false

		// Check all parts of the Variable.
		return parts.every(part => this[part] === expression[part])
	}

	// ensureVariable ensures that the given variable is a variable.
	static ensureVariable(variable) {
		if (variable instanceof Variable)
			return variable
		return new Variable(variable)
	}

	// interpret turns a string representation of a variable into an SO representation of a variable.
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

	// order determines the sorting order of variables. It takes two variables and returns a value larger than zero if b must be before a.
	static order(a, b) {
		const comparisonOrder = ['symbol', 'subscript', 'accent']
		const firstDifferentKey = comparisonOrder.find(key => a[key] !== b[key])
		if (firstDifferentKey)
			return (a[firstDifferentKey] || '') < (b[firstDifferentKey] || '') ? -1 : 1
		return 0 // All equal.
	}

	// sortVariableStrings takes a Set containing variable strings and turns it into an ordered array of Variable objects.
	static sortVariableStrings(variableStrings) {
		return [...variableStrings].map(str => new Variable(str)).sort(Variable.order)
	}
}
Variable.defaultSO = defaultSO
Variable.type = 'Variable'
module.exports = Variable

Variable.e = new Variable('e')
Variable.pi = new Variable('π')