const { expressionChecks } = require('../Expression')

// The checks below are generally equal to the respective checks for expressions.
const hasSumWithinProduct = (input) => input.someSide(side => expressionChecks.hasSumWithinProduct(side))
const hasSumWithinFraction = (input) => input.someSide(side => expressionChecks.hasSumWithinFraction(side))
const hasFraction = (input) => input.someSide(side => expressionChecks.hasFraction(side))
const hasFractionSatisfying = (input, check) => input.someSide(side => expressionChecks.hasFractionSatisfying(side, check))
const hasFractionWithinFraction = (input) => input.someSide(side => expressionChecks.hasFractionWithinFraction(side))
const hasPower = (input) => input.someSide(side => expressionChecks.hasPower(side))

module.exports = {
	...module.exports,
	hasSumWithinProduct,
	hasSumWithinFraction,
	hasFraction,
	hasFractionSatisfying,
	hasFractionWithinFraction,
	hasPower,
}