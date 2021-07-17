// This is the abstract FunctionMultiArgument class. It should not be instantiated, but it is used for multi-argument functions like fractions, logs, roots, etcetera.

const { processOptions, filterOptions } = require('../../../util/objects')
const { union } = require('../../../util/sets')

const Expression = require('./Expression')
const Constant = require('../Constant')
const Parent = Expression

const { ensureFO } = require('../')

class FunctionMultiArgument extends Parent {
	constructor(...args) {
		// If no arguments are given, use default values.
		if (args.length === 0) {
			super()
			return
		}

		// If one argument is given, which is not an expression, it's probably the SO.
		if (args.length === 1 && !(args[0] instanceof Expression)) {
			super(args[0])
			return
		}

		// Call the constructor. After all, we need access to static variables.
		super()
		if (args.length > this.constructor.args.length)
			throw new Error(`Invalid function input: too many parameters were provided. The function "${this.type}" only has ${this.constructor.args.length} parameters, yet received ${args.length} parameters.`)

		// Set up the SO from the arguments and apply them.
		const SO = {}
		args.forEach((arg, index) => {
			if (arg !== undefined) { // Filter out undefined arguments, to allow them to become their default values.
				const key = this.constructor.args[index]
				SO[key] = arg
			}
		})
		this.become(SO)
	}

	become(SO) {
		// Check own input.
		SO = this.checkAndRemoveType(SO)
		SO = processOptions(SO, this.constructor.defaultSO)

		// Handle parent input.
		super.become(filterOptions(SO, Parent.defaultSO))

		// Apply own input.
		this.constructor.args.forEach((key, index) => {
			this[key] = ensureFO(SO[key])
		})
	}

	toString(ignoreFactor = false) {
		let result = this.type.toLowerCase()
		this.constructor.args.forEach(key => {
			result += `[${this[key].str}]`
		})
		if (!ignoreFactor)
			result = this.addFactorToString(result)
		return result
	}

	requiresBracketsFor(level, ignoreFactor = false) {
		return level === Expression.powers
	}

	dependsOn(variable) {
		return this.constructor.args.some(key => this[key].dependsOn(variable))
	}

	getVariableStrings() {
		return union(...this.constructor.args.map(key => this[key].getVariableStrings()))
	}

	substitute(variable, substitution) {
		const newSO = this.SO
		this.constructor.args.forEach(key => {
			newSO[key] = this[key].substitute(variable, substitution)
		})
		return new this.constructor(newSO)
	}

	simplify(level) {
		const newSO = this.SO
		this.constructor.args.forEach(key => {
			newSO[key] = this[key].simplify(level)
		})
		return new this.constructor(newSO)
	}

	// ToDo: equals.

	static getDefaultSO(args) {
		const defaultSO = {
			...Parent.defaultSO,
		}
		args.forEach(key => {
			defaultSO[key] = new Constant(1)
		})
		return defaultSO
	}
}
module.exports = FunctionMultiArgument