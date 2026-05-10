import { type ExpressionSettings } from '@step-wise/math-input-value'

export type SimplificationPreset = SimplificationOptions | readonly SimplificationOptions[]
export type SimplificationContext = { options: SimplificationOptions, settings: ExpressionSettings }
export type SimplificationOptions = {
	// Sign options.
	removeDoubleNegatives: boolean // Remove two consecutive minus signs: -(-x) becomes x.
	removeMinusFromZero: boolean // Turns -0 into 0.
	removeDoublePlusMinusSigns: boolean // Remove consecutive plus-minus signs: ±±x becomes ±x.

	// Constant options.
	turnFloatsIntoIntegers: boolean // Turn floats into integers whenever possible. So when 4.5/1.5 reduces to 3.0, it becomes 3.
	factorizeIntegers: boolean // Turn integers into their factorizations. So 12 becomes 2^2*3. Conflicts with mergeProductNumbers and mergePowerNumbers.

	// Sum options.
	removeTrivialSums: boolean // Turn a sum with zero or one element into 0 or said element.
	flattenSums: boolean // Turn x+(y+z) into x+y+z.
	removePlusZeroFromSums: boolean // Remove "+0" from sums.
	mergeSumNumbers: boolean // Group numbers in sums. So 2+3*x+4 becomes 6+3*x.
	cancelSumTerms: boolean // Cancel terms in sums. So 2x+3y-2x becomes 3y. Ignored if groupSumTerms is applied.
	groupSumTerms: boolean // Group sum terms. So 2*x+3*x becomes (2+3)*x, then 5*x.
	pullOutCommonSumNumbers: boolean // Pull common numbers outside sums. So 6x+9y becomes 3(2x+3y). Conflicts with expanding sums.
	pullOutCommonSumFactors: boolean // Pull common factors outside sums. So x^3*(y+1)z + x^2*(y+1)^3*w becomes x^2*(y+1)(xz+(y+1)^2*w). Conflicts with expanding sums.
	sortSums: boolean // Sort terms in sums, putting simpler terms first.

	// Product options.
	removeTrivialProducts: boolean // Turn a product with zero or one element into 1 or said element.
	flattenProducts: boolean // Turn x*(y*z) into x*y*z.
	removeTimesZeroFromProduct: boolean // Turn "[...]*0" into 0.
	removeTimesOneFromProducts: boolean // Remove "*1" from products.
	pullPlusMinusToFront: boolean // In products, pull plus/minus symbols to the front and merge them.
	mergeProductNumbers: boolean // Group numbers in products. So 2*x*3*y*4*z becomes 24*x*y*z.
	mergeProductMinuses: boolean // Reduce negative numbers in products. So -2*x*-3*-1*4 becomes -2*x*3*1*4. Ignored if mergeProductNumbers is on.
	mergeInitialMinusOne: boolean // Merge initial -1 where appropriate. So -1*2 becomes -2, but 2*-1 and -2*1 stay unchanged.
	mergeProductFactors: boolean // Merge product factors into powers. So x*x^2 becomes x^3.
	expandProductsOfSums: boolean // Turn a*(b+c) into a*b+a*c.
	expandProductsOfSumsWithinSums: boolean // Expand products of sums only inside sums. Ignored if expandProductsOfSums is on.
	sortProducts: boolean // Sort factors in products, putting simpler terms first.

	// Fraction options.
	removeZeroNumeratorFromFraction: boolean // Turn 0/x into 0.
	removeOneDenominatorFromFraction: boolean // Turn x/1 into x and x/(-1) into -x.
	mergeFractionProducts: boolean // Turn products of fractions into one fraction. So a*(b/c) becomes ab/c.
	flattenFractions: boolean // Flatten nested fractions. So (a/b)/(c/d) becomes ad/bc.
	mergeFractionSums: boolean // Turn sums of fractions into one fraction. So a/b+c/d becomes (ad+bc)/(bd).
	splitFractions: boolean // Split fractions. So (a+b)/c becomes a/c+b/c. Conflicts with mergeFractionSums.
	crossOutFractionNumbers: boolean // Reduce numbers in fractions by GCD. So 18/12 becomes 3/2.
	crossOutFractionFactors: boolean // Cancel factors in fractions. So (ab)/(bc) becomes a/c. Only works when mergeProductFactors is true.
	pullConstantPartOutOfFraction: boolean // For display: turn 2(x+1)/(x+2) into 2*(x+1)/(x+2). Run only at the end.
	applyPolynomialCancellation: boolean // Cancel polynomial terms between numerator and denominator. Only univariate for now.

	// Power options.
	removeZeroExponentFromPower: boolean // Turn x^0 into 1.
	removeZeroBaseFromPower: boolean // Turn 0^x into 0.
	removeOneExponentFromPower: boolean // Turn x^1 into x.
	removeOneBaseFromPower: boolean // Turn 1^x into 1.
	mergePowerNumbers: boolean // Reduce powers containing only numbers into a number.
	removePowersWithinPowers: boolean // Turn (a^b)^c into a^(b*c).
	removeNegativePowers: boolean // Turn x^-2 into 1/x^2.
	expandPowers: boolean // Turn a^3 into a*a*a. Opposite of mergeProductFactors.
	expandPowersOfProducts: boolean // Turn (a*b)^n into a^n*b^n.
	expandPowersOfSums: boolean // Turn (a+b)^3 into a^3+3*a^2*b+3*a*b^2+b^3. Integer powers only.
	expandPowersOfSumsWithinSums: boolean // Expand powers of sums only inside sums. Ignored if expandPowersOfSums is on.

	// Root options.
	removeZeroRoot: boolean // Turn sqrt(0) and root(0) into 0.
	removeOneRoot: boolean // Turn sqrt(1) and root(1) into 1.
	removeIntegerRoot: boolean // Turn integer roots into integers. So sqrt(25) becomes 5, but sqrt(24) stays.
	removeCanceledRoot: boolean // Turn sqrt(x^2) into x and root[n](x^n) into x.
	turnRootIntoFractionExponent: boolean // Turn root[3](x) into x^(1/3).
	turnFractionExponentIntoRoot: boolean // Turn x^(1/3) into root[3](x).
	turnBaseTwoRootIntoSqrt: boolean // Turn root[2](x) into sqrt(x).
	expandRootsOfProducts: boolean // Turn sqrt(x*y) into sqrt(x)*sqrt(y).
	mergeProductsOfRoots: boolean // Turn sqrt(x)*sqrt(y) into sqrt(x*y). Ignored if expandRootsOfProducts is on.
	pullExponentsIntoRoots: boolean // Turn sqrt(4)^3 into sqrt(4^3).
	pullFactorsOutOfRoots: boolean // Turn sqrt(20) into 2*sqrt(5), and sqrt(a^3b^4c^5) into ab^2c^2*sqrt(ac).
	preventRootDenominators: boolean // Turn 1/sqrt(2) into sqrt(2)/2. Ignored if crossOutFractionFactors is on.

	// Logarithm options.
	removeOneLogarithm: boolean // Turn log(1) into 0.
	removeEqualBaseArgumentLogarithm: boolean // Turn log[x](x) into 1.
	turnLogIntoLn: boolean // Turn log[a](b) into ln(b)/ln(a).

	// Trigonometric function options.
	remove01TrigFunctions: boolean // Turn sin/cos/tan into 0, 1 or -1 where possible, and similar for asin/acos/atan.
	removeRootTrigFunctions: boolean // Turn sin/cos/tan into roots where possible, and similar for asin/acos/atan.
	turnTanIntoSinCos: boolean // Turn tan(x) into sin(x)/cos(x).

	// ToDo.
	cleanFractionPolynomials: boolean // Cancel polynomial factors in fractions, including multivariate cases eventually.
}
