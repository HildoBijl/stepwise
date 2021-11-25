// There is a variety of simplifying options available. First we define all of them and see what they mean.
const noSimplify = { // This is never applied, but only use to verify options given. (Some options contradict eachother.)

	// The following options are basic ones, usually applied.
	structure: false, // Simplify the structure of the object in a way that the expression itself does not seem rewritten. For instance, if there is a sum inside a sum, just turn it into one sum. Or if there is a sum of one element, just turn it into said element.
	removeUseless: false, // Remove useless elements. For instance, a sum with "+0" or a product with "*1" will be simplified.
	mergeSumNumbers: false, // Reduce the number of numbers that are used in sums. If there is a sum with numbers, like 2+3*x+4, group the numbers together, like 6+3*x.
	mergeProductNumbers: false, // Reduce the number of numbers that are used in products. If there is a product with constants, like 2*x*3*y*4*z, turn it into 24*x*y*z.
	cancelSumTerms: false, // Cancel terms in sums. So 2x+3y-2x becoming 3y. Note that this is a more basic version than groupSumTerms, which can group terms.

	// The following relate to Sums/Products.
	sortSums: false, // Sort the terms inside sums to put simpler terms first and more complex terms later.
	sortProducts: false, // Sort the terms inside products to put simpler terms first and more complex terms later.
	expandProductsOfSums: false, // Reduces a*(b+c) to (a*b+a*c).

	// The following options relate to Fractions.
	mergeFractionNumbers: false, // Reduce the numbers in a fraction by dividing out the GCD. So 18/12 reduces to 3/2.
	mergeFractionTerms: false, // Merge terms inside fraction. So (ab)/(bc) becomes a/c and x^2/(ax) becomes x/a. (Note: so far this has not been implemented for sums like (ax+bx)/x yet.)
	flattenFractions: false, // Turn fractions inside fractions into a single fraction. So (a/b)/(c/d) becomes (ad)/(bc), similarly a/(b/c) becomes (ac)/b and (a/b)/c becomes a/(bc).
	splitFractions: false, // Split up fractions. So (a+b)/c becomes a/c+b/c.
	mergeFractionProducts: false, // Turn products of fractions into single fractions. So a*(b/c) becomes (ab)/c and (a/b)*(c/d) becomes (ac)/(bd).
	mergeFractionSums: false, // Turns sums of fractions into a single fraction. So a/x+b/x becomes (a+b)/x and a/b+c/d becomes (ad+bc)/(bd).
	pullMinusBeforeFraction: false, // Turns (-2)/3 into -(2/3). For display purposes this is clearer, but for analysis it's pointless.

	// The following options relate to Powers.
	mergePowerNumbers: false, // Reduce the numbers used in powers: turn a power with only numbers into a number.
	mergeProductTerms: false, // Merge terms in products into powers. So x*x^2 becomes x^3.
	removePowersWithinPowers: false, // Reduces (a^b)^c to a^(b*c).
	removeNegativePowers: false, // Turns x^-2 into 1/x^2.
	expandPowersOfProducts: false, // Reduces (a*b)^n to a^n*b^n.
	expandPowersOfSums: false, // Reduces (a+b)^3 to (a^3 + 3*a^2*b + 3*a*b^2 + b^3). Only works on integer powers.

	// The following options relate to Functions.
	toBasicForm: false, // Turns more complex functions into more basic forms. So sqrt(a) becomes a^(1/2), [a]log(b) will be ln(b)/ln(a), tan(x) will be sin(x)/cos(x) and likewise simplifications ensue.

	// The following options relate to Equations. They do nothing for Expessions.
	allToLeft: false, // Moves all terms to the left. So will turn "ax+b=cx+d" into "ax+b-(cx+d)=0".

	// ToDo: implement the simplification methods below.

	groupSumTerms: false, // Check inside of sums whether terms can be grouped. For instance, 2*x+3*x can be grouped into (2+3)*x, after which the numbers can be merged to form 5*x.
	basicReductions: false, // Turns sin(arcsin(x)) into x, cos(pi) into -1 and y/y into 1. (Yes, this assumes y is not zero, but this is not a formal mathematical toolbox, so let's go along with it.)
}
module.exports.noSimplify = noSimplify

// Now we set up a variety of common combinations of simplify options.
const structureOnly = {
	...noSimplify,
	structure: true
}
module.exports.structureOnly = structureOnly

const removeUseless = {
	...structureOnly,
	removeUseless: true,
}
module.exports.removeUseless = removeUseless

const forDerivatives = {
	...removeUseless,
	toBasicForm: true,
}
module.exports.forDerivatives = forDerivatives

const basicClean = {
	...removeUseless,
	mergeSumNumbers: true,
	cancelSumTerms: true,
	mergeProductNumbers: true,
	mergeProductTerms: true,
	mergeFractionNumbers: true,
	flattenFractions: true,
	mergeFractionProducts: true,
	pullMinusBeforeFraction: true,
	mergePowerNumbers: true,
}
module.exports.basicClean = basicClean

const regularClean = {
	...basicClean,
	sortProducts: true,
	sortSums: true,
	mergeFractionTerms: true,
	removePowersWithinPowers: true,
	basicReductions: true,
}
module.exports.regularClean = regularClean

const forAnalysis = {
	...regularClean,
	expandProductsOfSums: true,
	removeNegativePowers: true,
	expandPowersOfProducts: true,
	expandPowersOfSums: true,
	mergeFractionSums: true,
	toBasicForm: true,
	pullMinusBeforeFraction: false,
}
module.exports.forAnalysis = forAnalysis

const forDisplay = {
	...regularClean,
	mergeFractionProducts: true,
	forDisplay: true,
}
module.exports.forDisplay = forDisplay

const expressionForAnalysis = {
	...forAnalysis,
	allToLeft: true,
}
module.exports.expressionForAnalysis = expressionForAnalysis