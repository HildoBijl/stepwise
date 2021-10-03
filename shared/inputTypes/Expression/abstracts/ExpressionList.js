// This is the abstract ExpressionList class. It should not be instantiated, but it is used for Sum, Product and such.

const { processOptions, filterOptions } = require('../../../util/objects')
const { union } = require('../../../util/sets')

const Expression = require('./Expression')
const Parent = Expression

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
		const terms = SO.terms.map(Expression.ensureExpression)

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

	substituteBasic(variable, substitution) {
		return new this.constructor({
			...this.SO,
			terms: this.terms.map(term => term.substitute(variable, substitution)),
		})
	}

	isNumeric() {
		return this.terms.every(term => term.isNumeric())
	}

	hasFloat() {
		return this.terms.some(term => term.hasFloat())
	}

	equalsBasic(expression, level) {
		// Depending on the settings, simplify each expression. This is necessary to ensure that, for instance, -x*2 will not be considered different from -2*x.
		let a = this
		let b = expression
		if (level === Expression.equalityLevels.onlyOrderChanges) {
			a = a.simplify(Expression.simplifyOptions.basicClean)
			b = b.simplify(Expression.simplifyOptions.basicClean)
		}

		// Check that the list type is equal.
		if (a.constructor !== b.constructor)
			return false

		// Check that the term lists have equal length.
		if (a.terms.length !== b.terms.length)
			return false

		// For exact equality, check that all arguments with matching indices are equal.
		if (level === Expression.equalityLevels.exact) {
			return a.terms.every((term, index) => term.equalsBasic(b.terms[index], level))
		}

		// When allowing order changes, check that every term has a matching term somewhere that is equal.
		if (level === Expression.equalityLevels.onlyOrderChanges) {
			// Try to match each term from this expression with a term from the other.
			const matched = a.terms.map(_ => false)
			return a.terms.every(term => { // For every term, find a matching partner.
				const index = b.terms.findIndex((otherTerm, index) => !matched[index] && term.equalsBasic(otherTerm, level)) // Is there a partner that has not been matched yet?
				if (index === -1)
					return false // No match found. Abort.
				matched[index] = true // Remember that this term from the other expression has been matched.
				return true // Match found. Continue.
			})
		}

		// Should never happen.
		throw new Error(`Unexpected expression equality level: did not expect the expression equality level "${level}". Cannot process this.`)
	}
}
ExpressionList.defaultSO = defaultSO
module.exports = ExpressionList