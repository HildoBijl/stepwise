// There is a variety of simplifying options available. First we define all of them and see what they mean.
const noSimplify = { // This is never applied, but only use to verify options given. (Some options contradict eachother.)

	// The following options are basic ones, usually applied.
	structure: false, // Simplify the structure of the object in a way that the expression itself does not seem rewritten. For instance, if there is a sum inside a sum, just turn it into one sum. Or if there is a sum of one element, just turn it into said element.
	removeUseless: false, // Remove useless elements. For instance, a sum with "+0" or a product with "*1" will be simplified.
	mergeSumNumbers: false, // Reduce the number of numbers that are used in sums. If there is a sum with numbers, like 2+3*x+4, group the numbers together, like 6+3*x.
	mergeProductNumbers: false, // Reduce the number of numbers that are used in products. If there is a product with constants, like 2*x*3*y*4*z, turn it into 24*x*y*z.

	// The following relate to Sums/Products.
	sortSums: false, // Sort the terms inside sums to put simpler terms first and more complex terms later.
	sortProducts: false, // Sort the terms inside products to put simpler terms first and more complex terms later.
	cancelSumTerms: false, // Cancel terms in sums. So 2x+3y-2x becoming 3y. Note that this is a more basic version than groupSumTerms, which can group terms, and it's not applied (ignored) if groupSumTerms is applied.
	groupSumTerms: false, // Check inside of sums whether terms can be grouped. For instance, 2*x+3*x can be grouped into (2+3)*x, after which the numbers can be merged to form 5*x.
	expandProductsOfSums: false, // Reduces a*(b+c) to (a*b+a*c).

	// The following options relate to Fractions.
	mergeFractionNumbers: false, // Reduce the numbers in a fraction by dividing out the GCD. So 18/12 reduces to 3/2.
	mergeFractionTerms: false, // Merge terms inside fraction. So (ab)/(bc) becomes a/c and (ax+bx^2)/(cx^3) becomes (a+bx)/(cx^2). Only works when mergeProductTerms is also true.
	flattenFractions: false, // Turn fractions inside fractions into a single fraction. So (a/b)/(c/d) becomes (ad)/(bc), similarly a/(b/c) becomes (ac)/b and (a/b)/c becomes a/(bc).
	splitFractions: false, // Split up fractions. So (a+b)/c becomes a/c+b/c.
	mergeFractionProducts: false, // Turn products of fractions into single fractions. So a*(b/c) becomes (ab)/c and (a/b)*(c/d) becomes (ac)/(bd).
	mergeFractionSums: false, // Turns sums of fractions into a single fraction. So a/x+b/x becomes (a+b)/x and a/b+c/d becomes (ad+bc)/(bd).

	// The following options relate to Powers.
	mergePowerNumbers: false, // Reduce the numbers used in powers: turn a power with only numbers into a number.
	mergeProductTerms: false, // Merge terms in products into powers. So x*x^2 becomes x^3.
	removePowersWithinPowers: false, // Reduces (a^b)^c to a^(b*c).
	removeNegativePowers: false, // Turns x^-2 into 1/x^2.
	expandPowersOfProducts: false, // Reduces (a*b)^n to a^n*b^n.
	expandPowersOfSums: false, // Reduces (a+b)^3 to (a^3 + 3*a^2*b + 3*a*b^2 + b^3). Only works on integer powers.
	pullPowersIntoRoots: false, // Reduces sqrt(4)^3 to sqrt(4^3).
	pullFactorsOutOfRoots: false, // Reduces sqrt(20) to 2*sqrt(5) and sqrt(a^3b^4c^5) to ab^2c^2*sqrt(ac).
	turnFractionPowerIntoRoot: false, // Reduces x^(1/3) to root[3](x).
	turnBaseTwoRootIntoSqrt: false, // Reduces root[2](x) to sqrt(x).

	// The following options relate to Functions.
	toBasicForm: false, // Turns more complex functions into more basic forms. So sqrt(a) becomes a^(1/2), [a]log(b) will be ln(b)/ln(a), tan(x) will be sin(x)/cos(x) and likewise simplifications ensue.
	basicReductions: false, // Turns sin(arcsin(x)) into x, cos(pi) into -1 and similar.

	// The following options relate to Equations. They do nothing for Expessions.
	allToLeft: false, // Moves all terms to the left. So will turn "ax+b=cx+d" into "ax+b-(cx+d)=0".

	// ToDo: implement the simplification methods below.

	cleanFractionPolynomials: false, // Check inside fractions whether polynomials can be cancelled. For instance, if you have "(x^2+3x+2)/(x^2-1)", it is equal to "((x+1)(x+2))/((x+1)(x-1))" which would be equal to "(x+2)/(x+1)". Similar simplifications can be done for fractions of multivariate polynomials.
}
module.exports.noSimplify = noSimplify

/*
 * Now we set up a variety of common combinations of simplify options.
 */

// structureOnly is a simplification that does nothing to the equation, but only to the structure. This should always be applied, because a wrong equation structure can lead to errors.
const structureOnly = {
	...noSimplify,
	structure: true
}
module.exports.structureOnly = structureOnly

// removeUseless removes useless things from equations. Think of adding/subtracting 0 or multiplying/dividing by 1. Stuff that's always required, unless you specifically want to look at how an equation is written.
const removeUseless = {
	...structureOnly,
	removeUseless: true,
}
module.exports.removeUseless = removeUseless

// elementaryClean writes things in such a way that the exact set-up of the equation does not matter for equality. Think of "(2/3)x" or "(2x)/3", or identically "-a/b" or "(-a)/b". It makes these equal.
const elementaryClean = {
	...structureOnly,
	mergeFractionProducts: true,
	mergeProductNumbers: true, // This is necessary to make "-(2)/(3)" equal to "(-2)/(3)" and not get confused with "((-1)*2)/(3)".
}
module.exports.elementaryClean = elementaryClean

// basicClean runs all basic clean-up methods available to starting mathematicians. Numbers like "2*3" are simplified to "6", fractions within fractions are squashed, and products "x*x" are merged into powers.
const basicClean = {
	...elementaryClean,
	removeUseless: true,
	mergeSumNumbers: true,
	mergeFractionNumbers: true,
	mergePowerNumbers: true,
	cancelSumTerms: true,
	mergeProductTerms: true,
	flattenFractions: true,
}
module.exports.basicClean = basicClean

// regularClean goes a few steps further than basicClean. It also uses tools taught at the end of high school, running more advanced fraction simplifications, power reductions and such. Also terms are sorted into a sensible order.
const regularClean = {
	...basicClean,
	sortProducts: true,
	groupSumTerms: true,
	mergeFractionTerms: true,
	mergeFractionSums: true,
	removePowersWithinPowers: true,
	basicReductions: true,
	pullPowersIntoRoots: true,
	pullFactorsOutOfRoots: true,
}
module.exports.regularClean = regularClean

// advancedClean goes even further than basicClean, applying further reductions to fractions and powers.
const advancedClean = {
	...regularClean,
	sortSums: true,
	expandProductsOfSums: true,
	removeNegativePowers: true,
	expandPowersOfProducts: true,
	expandPowersOfSums: true,
}
module.exports.advancedClean = advancedClean

// forAnalysis puts expression, for as much as possible, into a standard form. This subsequently allows for easy comparison.
const forAnalysis = {
	...advancedClean,
	toBasicForm: true,
}
module.exports.forAnalysis = forAnalysis

// forDerivatives puts expressions in a form making it easier to take derivatives. Some components (like tan(x)) do not have a derivative specified, but in basic form (sin(x)/cos(x)) derivatives are possible.
const forDerivatives = {
	...removeUseless,
	toBasicForm: true,
}
module.exports.forDerivatives = forDerivatives

// equationForAnalysis is similar to forAnalysis but then for equations. It also moves all terms to the left of the equation.
const equationForAnalysis = {
	...forAnalysis,
	allToLeft: true,
}
module.exports.equationForAnalysis = equationForAnalysis

// forDisplay makes simplifications that make an expression (or equation) more easy to display but not to evaluate. Think of turning x^(1/2) into sqrt(x), and x^(-2) into (1/x^2).
const forDisplay = {
	...removeUseless,
	turnFractionPowerIntoRoot: true,
	turnBaseTwoRootIntoSqrt: true,
	removeNegativePowers: true,
	flattenFractions: true, // Needed because removeNegativePowers may create fractions.
	sortProducts: true, // Needed because flattenFractions may create unordered products.
}
module.exports.forDisplay = forDisplay
