// This is the abstract ExpressionList class. It should not be instantiated, but it is used for Sum, Product and such.

const { processOptions, filterOptions } = require('../../../util/objects')
const { hasSimpleMatching } = require('../../../util/arrays')
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

	isNegative() {
		return firstOf(exponent.terms).isNegative()
	}

	hasFloat() {
		return this.terms.some(term => term.hasFloat())
	}

	// applyToElement takes a function and applies it to a specified elements in this ExpressionList. The indexArray can be a single index or an array of indices.
	applyToElement(indexArray, func) {
		if (!Array.isArray(indexArray))
			indexArray = [indexArray]
		return new this.constructor(this.terms.map((term, index) => indexArray.includes(index) ? func(term) : term))
	}

	// applyToElement takes a function and applies it to all elements in this ExpressionList.
	applyToAllElements(func) {
		return this.constructor(this.terms.map(term => func(term)))
	}

	recursiveSome(check, includeSelf) {
		return super.recursiveSome(check, includeSelf) || this.terms.some(term => term.recursiveSome(check))
	}

	recursiveEvery(check) {
		return super.recursiveEvery(check, includeSelf) && this.terms.every(term => term.recursiveEvery(check))
	}

	equalsBasic(expression, level) {
		// Check that the list type is equal.
		if (this.constructor !== expression.constructor)
			return false

		// Check that the term lists have equal length.
		if (this.terms.length !== expression.terms.length)
			return false

		// For exact equality, check that all arguments with matching indices are equal.
		if (level === Expression.equalityLevels.exact)
			return this.terms.every((term, index) => term.equalsBasic(expression.terms[index], level))

		// When allowing order changes, check that every term has a matching term somewhere that is equal.
		if (level === Expression.equalityLevels.onlyOrderChanges)
			return hasSimpleMatching(this.terms, expression.terms, (a, b) => a.equalsBasic(b, level))

		// Should never happen.
		throw new Error(`Unexpected expression equality level: did not expect the expression equality level "${level}". Cannot process this.`)
	}
}
ExpressionList.defaultSO = defaultSO
module.exports = ExpressionList