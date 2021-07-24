// This is the abstract ExpressionList class. It should not be instantiated, but it is used for Sum, Product and such.

const { processOptions, filterOptions } = require('../../../util/objects')
const { union } = require('../../../util/sets')

const Expression = require('./Expression')
const Parent = Expression
const { ensureFO } = require('..')

const defaultSO = {
	...Parent.defaultSO,
	terms: [],
}

class ExpressionList extends Parent {
	constructor(...args) {
		let SO
		if (args.length === 0) {
			SO = {}
		} else if (args.length === 1) {
			if (args[0] instanceof Expression)
				SO = { terms: [args[0]] }
			else if (Array.isArray(args[0]))
				SO = { terms: args[0] }
			else
				SO = args[0]
		} else {
			SO = { terms: args }
		}
		super(SO)
	}

	become(SO) {
		// Check own input.
		SO = this.checkAndRemoveType(SO)
		SO = processOptions(SO, defaultSO)
		if (!Array.isArray(SO.terms))
			throw new Error(`Invalid terms list: tried to create a ${this.constructor.type}, but the terms parameter was not an array. Its value was "${terms}".`)
		const terms = SO.terms.map(ensureFO)

		// Handle parent input.
		super.become(filterOptions(SO, Parent.defaultSO))

		// Apply own input.
		this.terms = terms

		// Set parent for the children.
		const parent = this
		this.terms.forEach(term => { term.parent = parent })
	}

	dependsOn(variable) {
		return this.terms.some(term => term.dependsOn(variable))
	}

	getVariableStrings() {
		return union(...this.terms.map(term => term.getVariableStrings()))
	}

	substitute(variable, substitution) {
		return new this.constructor({
			...this.SO,
			terms: this.terms.map(term => term.substitute(variable, substitution)),
		})
	}

	isNumeric() {
		return this.terms.every(term => term.isNumeric())
	}

	// equals checks for equality. Note that 2*(3*x) does not equal 6*x according to this function. Always simplify expressions before checking for equality.
	equals(expression, options = {}) {
		// ToDo later: check if this makes sense.

		// Compare the type and factor.
		if (!super.equals(expression, options))
			return false

		// Check the term length.
		if (this.terms.length !== expression.terms.length)
			return false

		// Walk through the terms and try to find a matching.
		const found = this.terms.map(() => false)
		return this.terms.every(term1 => { // For every term, find a matching partner.
			const index = expression.terms.findIndex((term2, index) => !found[index] && term1.equals(term2, options)) // Is there a partner that has not been matched yet?
			if (index === -1)
				return false // No match found. Abort.
			found[index] = true // Note that this term has been matched.
			return true // Match found. Continue.
		})
	}
}
ExpressionList.defaultSO = defaultSO
module.exports = ExpressionList