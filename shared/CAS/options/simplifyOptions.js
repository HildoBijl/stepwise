// There is a variety of simplifying options available. First we define all of them and see what they mean.
const noSimplify = { // This is never applied, but only use to verify options given. (Some options contradict eachother.)

	// The following options are basic ones, usually applied.
	structure: false, // Simplify the structure of the object in a way that the expression itself does not seem rewritten. For instance, if there is a sum inside a sum, just turn it into one sum. Or if there is a sum of one element, just turn it into said element.
	removeUseless: false, // Remove useless elements. For instance, a sum with "+0" or a product with "*1" will be simplified.
	mergeNumbers: false, // Reduce the number of numbers that are used. If there is a product with constants, like 2*x*3*y*4*z, turn it into 24*x*y*z. Or if there is a sum with numbers, like 2+3*x+4, group the numbers together, like 6+3*x.
	cancelSumTerms: false, // Cancel terms in sums. So 2x+3y-2x becoming 3y. Note that this is a more basic version than groupSumTerms, which can group terms.

	// The following options relate to fractions.
	reduceFractionNumbers: false, // Reduce the numbers in a fraction by dividing out the GCD. So 18/12 reduces to 3/2. This is only triggered if mergeNumbers is also true.
	mergeFractionTerms: false, // Merge terms inside fraction. So (ab)/(bc) becomes a/c and x^2/(ax) becomes x/a. (Note: so far this has not been implemented for sums like (ax+bx)/x yet.)
	flattenFractions: false, // Turn fractions inside fractions into a single fraction. So (a/b)/(c/d) becomes (ad)/(bc), similarly a/(b/c) becomes (ac)/b and (a/b)/c becomes a/(bc).
	splitFractions: false, // Split up fractions. So (a+b)/c becomes a/c+b/c.
	mergeFractionProducts: false, // Turn products of fractions into single fractions. So a*(b/c) becomes (ab)/c and (a/b)*(c/d) becomes (ac)/(bd).
	mergeFractionSums: false, // Turns sums of fractions into a single fraction. So a/x+b/x becomes (a+b)/x and a/b+c/d becomes (ad+bc)/(bd).

	// The following options relate to powers.
	mergeProductTerms: false, // Merge terms in products into powers. So x*x^2 becomes x^3.
	removePowersWithinPowers: false, // Reduces (a^b)^c to a^(b*c).

	// ToDo: implement the simplification methods below.

	groupSumTerms: false, // Check inside of sums whether terms can be grouped. For instance, 2*x+3*x can be grouped into (2+3)*x, after which the numbers can be merged to form 5*x.
	expandBrackets: false, // Minimize the number of brackets needed. If there is a product of sums, expand brackets. So (a+b)*(c+d) becomes a*c+a*d+b*c+b*d. Similarly for powers. (a+b)^3 gets a binomial expansion.
	sortProducts: false, // Sort the terms inside products to put simpler terms first and more complex terms later.
	sortSums: false, // Sort the terms inside sums to put simpler terms first and more complex terms later.
	basicReductions: false, // Turns sin(arcsin(x)) into x, cos(pi) into -1 and y/y into 1. (Yes, this assumes y is not zero, but this is not a formal mathematical toolbox, so let's go along with it.)
	forDisplay: false, // Make the expression easier to display. For instance, a*b^(-1) will be turned into a fraction a/b, and a^(1/2) will be turned into sqrt(a).
	forDerivatives: false, // Make the expression easier to get the derivative of. For instance, by rewriting [a]log(b) to ln(b)/ln(a) it's easier to get its derivative.
	forAnalysis: false, // Make the expression easier to analyze. Turn fractions into powers, so a/b becomes a*b^(-1), and sqrt(a) becomes a^(1/2). Similarly, [a]log(b) will be ln(b)/ln(a) and other similar simplifications ensue, using basic functions as much as possible.
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
	forDerivatives: true,
}
module.exports.forDerivatives = forDerivatives

const basicClean = {
	...removeUseless,
	mergeNumbers: true,
	cancelSumTerms: true,
	reduceFractionNumbers: true,
	flattenFractions: true,
	mergeFractionProducts: true,
	mergeProductTerms: true,
	mergeFractionTerms: true,
}
module.exports.basicClean = basicClean

const regularClean = {
	...basicClean,
	sortProducts: true,
	sortSums: true,
	removePowersWithinPowers: true,
	basicReductions: true,
}
module.exports.regularClean = regularClean

const forAnalysis = {
	...regularClean,
	mergeFractionSums: true,
	expandBrackets: true,
	forAnalysis: true,
}
module.exports.forAnalysis = forAnalysis

const forDisplay = {
	...regularClean,
	mergeFractionProducts: true,
	forDisplay: true,
}
module.exports.forDisplay = forDisplay