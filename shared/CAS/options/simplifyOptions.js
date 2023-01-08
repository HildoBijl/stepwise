// There is a variety of simplifying options available. First we define all of them and see what they mean.
const noSimplify = { // This is never applied, but only used to verify options given. (Some options contradict eachother.)

	// Sum options.
	flattenSums: false, // Turn x+(y+z) into x+y+z.
	removeTrivialSums: false, // Turn a sum with zero or one element into 0 or said element, respectively.
	removePlusZeroFromSums: false, // Remove "+0" from sums.
	mergeSumNumbers: false, // Reduce the number of numbers that are used in sums. If there is a sum with numbers, like 2+3*x+4, group the numbers together, like 6+3*x.
	sortSums: false, // Sort the terms inside sums to put simpler terms first and more complex terms later.
	cancelSumTerms: false, // Cancel terms in sums. So 2x+3y-2x becoming 3y. Note that this is a more basic version than groupSumTerms, which can group terms, and it's not applied (ignored) if groupSumTerms is applied.
	groupSumTerms: false, // Check inside of sums whether terms can be grouped. For instance, 2*x+3*x can be grouped into (2+3)*x, after which the numbers can be merged to form 5*x.
	pullOutCommonSumNumbers: false, // Pull common numbers outside of a sum. So this turns "6x+9y" into "3(2x+3y)". Conflicts with expandProductsOfSums and expandPowersOfSums: these settings deactivate this one.
	pullOutCommonSumFactors: false, // Pull common terms outside of a sum. So this turns "x^3*(y+1)z + x^2*(y+1)^3*w" into "x^2*(y+1)(xz+(y+1)^2*w)". Conflicts with expandProductsOfSums and expandPowersOfSums: these settings deactivate this one.

	// Product options.
	flattenProducts: false, // Turn x*(y*z) into x*y*z.
	removeTrivialProducts: false, // Turn a product with zero or one element into 1 or said element, respectively.
	removeTimesZeroFromProduct: false, // Turn "[...]*0" into "0".
	removeTimesOneFromProducts: false, // Remove "*1" from products.
	mergeProductNumbers: false, // Reduce the number of numbers that are used in products. If there is a product with constants, like 2*x*3*y*4*z, turn it into 24*x*y*z.
	mergeProductMinuses: false, // Reduces the negative numbers in products. Turns "-2*x*-3*-1*4" into "-2*x*3*1*4". If mergeProductNumbers is on this option is ignored.
	mergeInitialMinusOne: false, // Reduces a minus one at the start into a number where appropriate. So "-1 * 2" becomes "-2" but "2 * -1" and "-2 * 1" stay the same.
	sortProducts: false, // Sort the terms inside products to put simpler terms first and more complex terms later.
	mergeProductTerms: false, // Merge terms in products into powers. So x*x^2 becomes x^3.
	expandProductsOfSums: false, // Reduces a*(b+c) to (a*b+a*c).

	// Fraction options.
	removeZeroNumeratorFromFraction: false, // Turn 0/x into 0.
	removeOneDenominatorFromFraction: false, // Turn x/1 into 1 and x/(-1) into -x.
	mergeFractionProducts: false, // Turn products of fractions into single fractions. So a*(b/c) becomes (ab)/c and (a/b)*(c/d) becomes (ac)/(bd).
	flattenFractions: false, // Turn fractions inside fractions into a single fraction. So (a/b)/(c/d) becomes (ad)/(bc), similarly a/(b/c) becomes (ac)/b and (a/b)/c becomes a/(bc).
	mergeFractionSums: false, // Turns sums of fractions into a single fraction. So a/x+b/x becomes (a+b)/x and a/b+c/d becomes (ad+bc)/(bd).
	splitFractions: false, // Split up fractions. So (a+b)/c becomes a/c+b/c. Conflicts with mergeFractionSums: that setting deactives this one.
	crossOutFractionNumbers: false, // Reduce the numbers in a fraction by dividing out the GCD. So 18/12 reduces to 3/2.
	crossOutFractionTerms: false, // Merge terms inside fraction. So (ab)/(bc) becomes a/c and (ax+bx^2)/(cx^3) becomes (a+bx)/(cx^2). Only works when mergeProductTerms is also true.
	pullConstantPartOutOfFraction: false, // For display purposes turn (2(x+1)/(x+2)) into 2*(x+1)/(x+2), and similarly (2*x)/(3*y) into (2/3)*(x/y). Should only be done at the end to prevent infinite loops.

	// Power options.
	removeZeroExponentFromPower: false, // Turn x^0 into 1.
	removeZeroBaseFromPower: false, // Turn 0^x into 0.
	removeOneExponentFromPower: false, // Turn x^1 into x.
	removeOneBaseFromPower: false, // Turn 1^x into 1.
	mergePowerNumbers: false, // Reduce the numbers used in powers: turn a power with only numbers into a number.
	removePowersWithinPowers: false, // Reduces (a^b)^c to a^(b*c).
	removeNegativePowers: false, // Turns x^-2 into 1/x^2.
	expandPowersOfProducts: false, // Reduces (a*b)^n to a^n*b^n.
	expandPowersOfSums: false, // Reduces (a+b)^3 to (a^3 + 3*a^2*b + 3*a*b^2 + b^3). Only works on integer powers.

	// Root options.
	removeZeroRoot: false, // Turn sqrt(0) and root(0) into 0.
	removeOneRoot: false, // Turn sqrt(1) and root(1) into 1.
	turnRootIntoFractionExponent: false, // Reduces root[3](x) to x^(1/3).
	turnFractionExponentIntoRoot: false, // Reduces x^(1/3) to root[3](x).
	turnBaseTwoRootIntoSqrt: false, // Reduces root[2](x) to sqrt(x).
	expandRootsOfProducts: false, // Turn sqrt(x*y) into sqrt(x)*sqrt(y).
	mergeProductsOfRoots: false, // Turn sqrt(x)*sqrt(y) into sqrt(x*y). This is the opposite of expandRootsOfProducts, so this will be done last, in the cleaning phase.
	pullExponentsIntoRoots: false, // Reduces sqrt(4)^3 to sqrt(4^3).
	pullFactorsOutOfRoots: false, // Reduces sqrt(20) to 2*sqrt(5) and sqrt(a^3b^4c^5) to ab^2c^2*sqrt(ac).

	// Logarithm options.
	removeOneLogarithm: false, // Turn log(1) into 0.
	removeEqualBaseArgumentLogarithm: false, // Turn log[x](x) into 1.
	turnLogIntoLn: false, // Turns log[a](b) into ln(b)/ln(a).

	// Trigonometric function options.
	remove01TrigFunctions: false, // Turns sin/cos/tan into 0, 1 or -1 where possible, and similar for asin/acos/atan.
	removeRootTrigFunctions: false, // Turns sin/cos/tan into roots (like sqrt(2)/2 and sqrt(3)/2) where possible, and similar for asin/acos/atan.
	turnTanIntoSinCos: false, // Turns tan(x) into sin(x)/cos(x).

	// Equation options. These options do nothing for Expressions.
	allToLeft: false, // Moves all terms to the left. So will turn "ax+b=cx+d" into "ax+b-(cx+d)=0".

	// ToDo: implement the simplification methods below.

	cleanFractionPolynomials: false, // Check inside fractions whether polynomials can be cancelled. For instance, if you have "(x^2+3x+2)/(x^2-1)", it is equal to "((x+1)(x+2))/((x+1)(x-1))" which would be equal to "(x+2)/(x+1)". Similar simplifications can be done for fractions of multivariate polynomials.

}
module.exports.noSimplify = noSimplify

// The displayOptions are the options that are initially not applied, but are only done at the end. This is because they may cause conflicts (like infinite loops) when combined with the other. We don't want to have sqrt(x) be turned into x^(1/2) and then back to sqrt(x) until forever.
const displayOptionList = ['pullConstantPartOutOfFraction', 'turnFractionExponentIntoRoot', 'turnBaseTwoRootIntoSqrt', 'mergeProductsOfRoots', 'sortProducts', 'sortSums', 'pullFactorsOutOfRoots']
module.exports.displayOptionList = displayOptionList

/*
 * Now we set up a variety of common combinations of simplify options.
 */

// structureOnly is a simplification that does nothing to the equation, but only to the structure. This should always be applied, because a wrong equation structure can lead to errors.
const structureOnly = {
	flattenSums: true,
	removeTrivialSums: true,
	flattenProducts: true,
	removeTrivialProducts: true,
}
module.exports.structureOnly = { ...noSimplify, ...structureOnly }

// elementaryClean writes things in such a way that the exact set-up of the equation does not matter for equality. Think of "(2/3)x" or "(2x)/3", or identically "-a/b" or "(-a)/b". It makes these equal.
const elementaryClean = {
	...structureOnly,
	mergeFractionProducts: true,
	mergeInitialMinusOne: true, // This is necessary to make "-(2)/(3)" equal to "(-2)/(3)" and not get confused with "((-1)*2)/(3)".
}
module.exports.elementaryClean = { ...noSimplify, ...elementaryClean }

// removeUseless removes useless things from equations. Think of adding/subtracting 0, multiplying/dividing by 1 and taking the power of 0 or 1.
const removeUseless = {
	...elementaryClean,
	removePlusZeroFromSums: true,
	removeTimesZeroFromProduct: true,
	removeTimesOneFromProducts: true,
	removeZeroNumeratorFromFraction: true,
	removeOneDenominatorFromFraction: true,
	removeZeroExponentFromPower: true,
	removeZeroBaseFromPower: true,
	removeOneExponentFromPower: true,
	removeOneBaseFromPower: true,
	removeZeroRoot: true,
	removeOneRoot: true,
	removeOneLogarithm: true,
}
module.exports.removeUseless = { ...noSimplify, ...removeUseless }

// basicClean runs all basic clean-up methods available to starting mathematicians. Numbers like "2*3" are simplified to "6", fractions within fractions are squashed, and products "x*x" are merged into powers.
const basicClean = {
	...removeUseless,
	mergeSumNumbers: true,
	mergeProductNumbers: true,
	crossOutFractionNumbers: true,
	mergePowerNumbers: true,
	cancelSumTerms: true,
	mergeFractionProducts: true,
	mergeProductTerms: true,
	flattenFractions: true,
}
module.exports.basicClean = { ...noSimplify, ...basicClean }

// regularClean goes a few steps further than basicClean. It also uses tools taught at the end of high school, running more advanced fraction simplifications, power reductions and such. Also product terms are sorted into a sensible order.
const regularClean = {
	...basicClean,
	sortProducts: true,
	groupSumTerms: true,
	crossOutFractionTerms: true,
	mergeFractionSums: true,
	removePowersWithinPowers: true,
	removeNegativePowers: true,
	pullExponentsIntoRoots: true,
	removeEqualBaseArgumentLogarithm: true,
}
module.exports.regularClean = { ...noSimplify, ...regularClean }

// advancedClean goes even further than basicClean, applying further reductions to fractions and powers.
const advancedClean = {
	...regularClean,
	pullOutCommonSumNumbers: true,
	pullOutCommonSumFactors: true,
	sortSums: true,
	turnRootIntoFractionExponent: true,
	pullFactorsOutOfRoots: true,
	expandPowersOfProducts: true,
	expandRootsOfProducts: true,
	remove01TrigFunctions: true,
	removeRootTrigFunctions: true,
}
module.exports.advancedClean = { ...noSimplify, ...advancedClean }

// forAnalysis puts expression, for as much as possible, into a standard form. This subsequently allows for easy comparison.
const forAnalysis = {
	...advancedClean,
	pullOutCommonSumNumbers: false,
	pullOutCommonSumFactors: false,
	expandProductsOfSums: true,
	expandPowersOfSums: true,
	turnLogIntoLn: true,
	turnTanIntoSinCos: true,
}
module.exports.forAnalysis = { ...noSimplify, ...forAnalysis }

// forDerivatives puts expressions in a form making it easier to take derivatives. Some components (like tan(x)) do not have a derivative specified, but in basic form (sin(x)/cos(x)) derivatives are possible.
const forDerivatives = {
	...removeUseless,
	turnRootIntoFractionExponent: true,
	turnLogIntoLn: true,
	turnTanIntoSinCos: true,
}
module.exports.forDerivatives = { ...noSimplify, ...forDerivatives }

// equationForAnalysis is similar to forAnalysis but then for equations. It also moves all terms to the left of the equation.
const equationForAnalysis = {
	...forAnalysis,
	allToLeft: true,
}
module.exports.equationForAnalysis = { ...noSimplify, ...equationForAnalysis }

// forDisplay makes simplifications that make an expression (or equation) more easy to display but not to evaluate. Think of turning x^(1/2) into sqrt(x), and x^(-2) into (1/x^2).
const forDisplay = {
	...removeUseless,
	pullConstantPartOutOfFraction: true,
	turnFractionExponentIntoRoot: true,
	turnBaseTwoRootIntoSqrt: true,
	mergeProductsOfRoots: true,
}
module.exports.forDisplay = { ...noSimplify, ...forDisplay }

// Merge a few other option sets.
module.exports.elementaryCleanDisplay = { ...noSimplify, ...forDisplay, ...elementaryClean }
module.exports.basicCleanDisplay = { ...noSimplify, ...forDisplay, ...basicClean }
module.exports.regularCleanDisplay = { ...noSimplify, ...forDisplay, ...regularClean }
module.exports.advancedCleanDisplay = { ...noSimplify, ...forDisplay, ...advancedClean }