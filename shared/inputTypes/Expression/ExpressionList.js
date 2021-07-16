// This is the abstract ExpressionList class. It should not be instantiated, but it is used for Sum, Product and such.

const { processOptions, filterOptions } = require('../../util/objects')

const Expression = require('./Expression')
const Parent = Expression
const { ensureFO } = require('./')

const defaultSO = {
	...Parent.defaultSO,
	terms: [],
}

class ExpressionList extends Parent {
	become(SO) {
		// Check own input.
		SO = processOptions(SO, defaultSO)
		if (!Array.isArray(SO.terms))
			throw new Error(`Invalid terms list: tried to create a ${this.constructor.name}, but the terms parameter was not an array. Its value was "${terms}".`)
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

	getVariables() {
		let set = new Set()
		this.terms.forEach(term => {
			term.getVariables().forEach(variable => {
				set.add(variable) // ToDo: check if this filters out uniques.
			})
		})
		return [...set].sort() // ToDo: check sort. Use Variable sort function?
	}

	substitute(variable, substitution) {
		return new this.constructor({
			...this.SO,
			terms: this.terms.map(term => term.substitute(variable, substitution)),
		})
	}

	// equals checks for equality. Note that 2*(3*x) does not equal 6*x according to this function. Always simplify expressions before checking for equality.
	equals(expression, options = {}) {
		// ToDo later: check if this makes sense.

		// Check that we have an expression of an equal number of terms and with equal factor.
		if (this.constructor !== expression.constructor)
			return false
		if (this.terms.length !== expression.terms.length)
			return false
		if (options.ignoreFactor !== true && this.factor !== expression.factor)
			return false

		// Walk through the terms and try to find a matching.
		const found = this.terms.map(() => false)
		return this.terms.every(term1 => { // For every term, find a matching partner.
			const index = expression.terms.findIndex((term2, index) => !found[index] && term1.equals(term2)) // Is there a partner that has not been matched yet?
			if (index === -1)
				return false // No match found. Abort.
			found[index] = true // Note that this term has been matched.
			return true // Match found. Continue.
		})
	}
}
ExpressionList.defaultSO = defaultSO
module.exports = ExpressionList