const { Integer, Sum, Product, Fraction, Power } = require('./Expression')
const { onlyOrderChanges } = require('./comparisons')

// isInteger checks if the given quantity reduces to an integer.
function isInteger(input) {
	return input.isNumeric() && input.cleanForAnalysis().isSubtype(Integer)
}

// hasSumWithinProduct checks if there are sums within products, like a*(b+c). It effectively checks whether brackets have been properly expanded.
function hasSumWithinProduct(input) {
	return input.recursiveSome(term => term.isSubtype(Product) && term.factors.some(factor => factor.isSubtype(Sum)))
}

// hasSumWithinFraction checks if there is a sum within a fraction, like (a+b)/c.
function hasSumWithinFraction(input) {
	return input.recursiveSome(term => term.isSubtype(Fraction) && term.recursiveSome(subTerm => subTerm.isSubtype(Sum)))
}

// hasSumWithinPowerBase checks if there is a power whose base is a sum.
function hasSumWithinPowerBase(input) {
	return input.recursiveSome(term => term.isSubtype(Power) && term.base.recursiveSome(term => term.isSubtype(Sum)))
}

// hasProductWithinPowerBase checks if there is a power whose base is a product.
function hasProductWithinPowerBase(input) {
	return input.recursiveSome(term => term.isSubtype(Power) && term.base.recursiveSome(term => term.isSubtype(Product)))
}

// hasPowerWithinPowerBase checks if there is a power whose base is or contains a power.
function hasPowerWithinPowerBase(input) {
	return input.recursiveSome(term => term.isSubtype(Power) && term.base.recursiveSome(term => term.isSubtype(Power)))
}

// hasNegativeExponent checks if there is a power whose exponent is negative. (It does not recognize a^(-b).)
function hasNegativeExponent(input) {
	return input.recursiveSome(term => term.isSubtype(Power) && term.exponent.isNegative())
}

// hasSimilarTerms checks if a sum has similar terms that can be merged, like 4x+3+2x, which can merge 4x and 2x.
function hasSimilarTerms(input) {
	return !onlyOrderChanges(input.removeUseless({ groupSumTerms: true, mergeSumNumbers: true, mergeProductFactors: true }), input.elementaryClean())
}

// hasFraction checks if there is a fraction inside this Expression. It also gives true if the Expression itself is a fraction, unless this is specifically set to be ignored (by passing false).
function hasFraction(input, includeSelf = true) {
	return input.recursiveSome(term => term.isSubtype(Fraction), includeSelf)
}

// hasFractionSatisfying checks if there is a fraction inside this Expression that also satisfies another given check.
function hasFractionSatisfying(input, check) {
	return input.recursiveSome(term => term.isSubtype(Fraction) && check(term))
}

// hasFractionWithinFraction checks if there are fractions inside this Expression that have further fractions inside them.
function hasFractionWithinFraction(input) {
	return hasFractionSatisfying(input, fraction => hasFraction(fraction, false))
}

// hasVariableInDenominator checks if there is a fraction that has the given variable in the denominator.
function hasVariableInDenominator(input, variable) {
	return hasFractionSatisfying(input, fraction => fraction.denominator.dependsOn(variable))
}

// hasPower checks if there is a power inside this Expression.
function hasPower(input, includeSelf = true) {
	return input.recursiveSome(term => term.isSubtype(Power), includeSelf)
}

// isPolynomial checks if this expression is a polynome: only sums, products and powers with integer exponents. Fractions are only allowed when dividing by a numeric value, like x/2 or y/pi, but not when dividing by variables like y/x.
function isPolynomial(input) {
	return input.recursiveEvery(term => {
		if (!(term instanceof Function))
			return true // Not a function. So a base type like a Constant, Variable, Sum or Product.
		if (term.isSubtype(Fraction))
			return term.denominator.isNumeric() // A fraction. Is the denominator a number?
		if (term.isSubtype(Power))
			return isPolynomial(term.base) && term.exponent.isSubtype(Integer) && term.exponent.number >= 0 // A power. Does it have a polynomial base and a non-negative integer power?
		return false // Other type of function.
	})
}

// isRational checks if this expression is a rational expression: only polynomes and fractions.
function isRational(input) {
	return input.recursiveEvery(term => {
		if (!(term instanceof Function))
			return true // Not a function. So a base type like a Constant, Variable, Sum or Product.
		if (term.isSubtype(Fraction))
			return true // A fraction. This is always fine.
		if (term.isSubtype(Power))
			return isPolynomial(term.base) && term.exponent.isSubtype(Integer) // A power. Does it have a polynomial base and an integer power?
		return false // Other type of function.
	})
}

module.exports = {
	...module.exports,
	isInteger,
	hasSumWithinProduct,
	hasSumWithinFraction,
	hasSumWithinPowerBase,
	hasProductWithinPowerBase,
	hasPowerWithinPowerBase,
	hasNegativeExponent,
	hasSimilarTerms,
	hasFraction,
	hasFractionSatisfying,
	hasFractionWithinFraction,
	hasVariableInDenominator,
	hasPower,
	isPolynomial,
	isRational,
}