const { Sum, expressionChecks } = require('../Expression')

const { equivalent: equivalentExpression, constantMultiple: constantMultipleExpression, hasFractionWithinFraction: expressionHasFractionWithinFraction, hasSumWithinProduct: expressionHasSumWithinProduct } = expressionChecks

/*
 * Define basic Equation check functions.
 */

// exactEqual checks if two expressions are exactly equal, in every way.
function exactEqual(input, correct) {
	return correct.equals(input, false)
}

// onlyOrderChanges checks if two equations are equal, allowing order changes in sums and products. So "2*x=3+5" equals "x*2=5+3" but not "3+5=2*x".
function onlyOrderChanges(input, correct) {
	return correct.equals(input, true)
}

// onlyOrderChangesAndSwitch checks if two equations are equal, allowing order changes and side switches. So "2*x=3+5" equals both "x*2=5+3" and "5+3=x*2".
function onlyOrderChangesAndSwitch(input, correct) {
	return onlyOrderChanges(input, correct) || onlyOrderChanges(input, correct.switch())
}

// onlyOrderChangesAndShifts checks if two equations are equal, where terms may be shifted from one side to the other. Switching sides completely (effectively taking the negative of the equation) is also allowed. So "a+b=c+d" equals "a+b-c=d" and also "d=a+b-c". To figure this out, all terms are brought to one side and the resulting expressions are checked for equality allowing order changes.
function onlyOrderChangesAndShifts(input, correct) {
	const getTerms = (side) => side.isType(Sum) ? side.terms : [side]
	const gatherTerms = (equation) => [...getTerms(equation.left), ...getTerms(equation.right).map(term => term.applyMinus())]
	const inputSum = new Sum(...gatherTerms(input)).removeUseless()
	const correctSum = new Sum(...gatherTerms(correct)).removeUseless()
	const correctSumNegative = new Sum(...gatherTerms(correct).map(term => term.applyMinus())).removeUseless()
	return onlyOrderChanges(inputSum, correctSum) || onlyOrderChanges(inputSum, correctSumNegative)
}

// onlyElementaryClean checks if the two sides are equal after an elementary clean. (Order changes are still allowed.)
function onlyElementaryClean(input, correct) {
	return onlyOrderChanges(input.elementaryClean(), correct.elementaryClean())
}

// onlyElementaryCleanAndSwitch also allows side switches.
function onlyElementaryCleanAndSwitch(input, correct) {
	return onlyOrderChangesAndSwitch(input.elementaryClean(), correct.elementaryClean())
}

// onlyElementaryCleanAndShifts allows shifting of terms too.
function onlyElementaryCleanAndShifts(input, correct) {
	return onlyOrderChangesAndShifts(input.elementaryClean(), correct.elementaryClean())
}

module.exports = {
	exactEqual,
	onlyOrderChanges,
	onlyOrderChangesAndSwitch,
	onlyOrderChangesAndShifts,
	onlyElementaryClean,
	onlyElementaryCleanAndSwitch,
	onlyElementaryCleanAndShifts,
}

/*
 * Define advanced Equation check functions.
 */

// equivalentSides checks if both sides of the equation are equivalent. So "2*2=x^2/x" equals "4=x", but not "x=4".
function equivalentSides(input, correct) {
	return correct.everySide((side, part) => equivalentExpression(side, input[part]))
}

// equivalentSidesWithSwitch checks if both sides of the equation are equivalent. So "2*2=x^2/x" equals "4=x" and "x=4". However, "2+3=x" does NOT equal "2=x-3" because this contains interactions between sides.
function equivalentSidesWithSwitch(input, correct) {
	return equivalentSides(input, correct) || equivalentSides(input, correct.switch())
}

// equivalent checks if two equations are equivalent with respect to constants. So constant multiples are allowed, but variable multiples are not. In other words, "2x=y" equals "6x=3y", but not "2xz=yz".
function equivalent(input, correct) {
	return constantMultipleExpression(input.left.subtract(input.right), correct.left.subtract(correct.right))
}

module.exports = {
	...module.exports,
	equivalentSides,
	equivalentSidesWithSwitch,
	equivalent,
}

/*
 * Define checks for properties of Equations. They are often similar to the corresponding checks for Expressions.
 */

const hasFractionWithinFraction = (input) => input.someSide(side => expressionHasFractionWithinFraction(side))
const hasSumWithinProduct = (input) => input.someSide(side => expressionHasSumWithinProduct(side))

module.exports = {
	...module.exports,
	hasFractionWithinFraction,
	hasSumWithinProduct,
}