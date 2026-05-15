export const allSimplificationOptionsList = [
	// Sign options.
	'removeSignsFromZeros', // Turns -0 into 0 and identically ±0 to 0.
	'removeDoubleNegatives', // Remove two consecutive minus signs: -(-x) becomes x.
	'removeDoubleSigns', // Remove consecutive signs: ±±x becomes ±x, and both -±x and ±-x become ±x.. Requires removeDoubleNegatives.

	// Constant options.
	'turnFloatsIntoIntegers', // Turn floats into integers whenever possible. So when 4.5/1.5 reduces to 3.0, it becomes 3.
	'factorizeIntegers', // Turn integers into their factorizations. So 12 becomes 2^2*3. Conflicts with mergeProductNumbers and mergePowerNumbers.

	// Sum options.
	'flattenSums', // Turn x+(y+z) into x+y+z.
	'removeZeroesFromSums', // Remove "+0" from sums.
	'mergeSumNumbers', // Group numbers in sums. So 2+3*x+4 becomes 6+3*x.
	'cancelSumTerms', // Cancel terms in sums. So 2x+3y-2x becomes 3y.
	'groupSumTerms', // Group sum terms. So 2*x+3*x becomes (2+3)*x, then 5*x.
	'expandMinusSums', // Turn -(x-y) into -x-(-y).
	'expandPlusMinusSums', // Turn ±(x-y) into ±x±(-y).
	'pullOutCommonSumNumbers', // Pull common numbers outside sums. So 6x+9y becomes 3(2x+3y). Only examines leading numbers. Conflicts with expandProductsOfSums.
	'pullOutCommonSumFactors', // Pull common factors outside sums. So x^3*(y+1)*z + x^2*(y+1)^3*w becomes x^2*(y+1)*(xz+(y+1)^2*w). Conflicts with expandProductsOfSums.
	'sortSums', // Sort terms in sums, putting simpler terms first.

	// Product options.
	'flattenProducts', // Turn x*(y*z) into x*y*z.
	'mergeProductMinuses', // Reduce negative numbers in products. So -2*x*-3*-1*4 becomes -2*x*3*1*4.
	'mergeProductPlusMinuses', // In products, pull plus/minus symbols to the front and merge them.
	'reduceProductsWithZero', // Turn "[...]*0" into 0.
	'removeOnesFromProducts', // Remove "*1" from products.
	'mergeProductNumbers', // Group numbers in products. So 2*x*3*y*4*z becomes 24*x*y*z. Puts numbers in products at the start.
	'mergeProductFactors', // Merge product factors into powers. So x*x^2 becomes x^3.
	'expandProductsOfSums', // Turn a*(b+c) into a*b+a*c.
	'expandProductsOfSumsWithinSums', // Expand products of sums only inside sums. Conflicts with expandProductsOfSums.
	'sortProducts', // Sort factors in products, putting simpler terms first.

	// Fraction options.
	'reduceFractionsWithZeroNumerator', // Turn 0/x into 0.
	'reduceFractionsWithOneDenominator', // Turn x/1 into x and x/(-1) into -x.
	'mergeFractionProducts', // Turn products of fractions into one fraction. So a*(b/c) becomes ab/c.
	'flattenFractions', // Flatten nested fractions. So (a/b)/(c/d) becomes ad/bc.
	'mergeFractionSums', // Turn sums of fractions into one fraction. So a/b+c/d becomes (ad+bc)/(bd).
	'splitFractions', // Split fractions. So (a+b)/c becomes a/c+b/c. Conflicts with mergeFractionSums.
	'mergeFractionMinuses', // Turn -x/-y into x/y, (-x)/y into -(x/y) and x/(-y) into -(x/y).
	'mergeFractionNumbers', // Reduce numbers in fractions by GCD. So 18/12 becomes 3/2 and (18x+24y)/(12z) becomes (3x+4y)/(2z). Only considers leading numbers.
	'cancelFractionFactors', // Cancel factors in fractions. So (xy)/(yz) becomes x/z. Only works on exact matches: x^3/x^2 remains as is.
	'mergeFractionFactors', // Merge factors in fractions. So x^a/x^b becomes x^(a-b). Requires mergeProductFactors.
	'normalizeFractionMinuses', // Makes sure the first term in the numerator/denominator does not have a minus sign. Requires mergeProductMinuses, removeDoubleNegatives and sortSums.
	'applyPolynomialCancellation', // Cancel polynomial terms between numerator and denominator. Only univariate for now.

	// Power options.
	'reducePowersWithZeroExponent', // Turn x^0 into 1.
	'reducePowersWithZeroBase', // Turn 0^x into 0.
	'removeOneExponentsFromPowers', // Turn x^1 into x.
	'reducePowersWithOneBase', // Turn 1^x into 1.
	'mergePowerMinuses', // Reduce (-x)^n for integer n to either x^n or -x^n.
	'mergePowerNumbers', // Reduce powers containing only numbers into a number.
	'removePowersWithinPowers', // Turn (a^b)^c into a^(b*c).
	'convertNegativePowers', // Turn x^-2 into 1/x^2.
	'expandPowers', // Turn a^3 into a*a*a. Conflicts with mergeProductFactors.
	'expandPowersOfProducts', // Turn (a*b)^n into a^n*b^n.
	'expandPowersOfFractions', // Turn (a/b)^n into a^n/b^n.
	'expandPowersOfSums', // Turn (a+b)^3 into a^3+3*a^2*b+3*a*b^2+b^3. Integer powers only.
	'expandPowersOfSumsWithinSums', // Expand powers of sums only inside sums. Conflicts with expandPowersOfSums.

	// Root options.
	'reduceRootsWithZeroRadicand', // Turn sqrt(0) and root(0) into 0.
	'reduceRootsWithOneRadicand', // Turn sqrt(1) and root(1) into 1.
	'reduceIntegerRoots', // Turn integer roots into integers. So sqrt(25) becomes 5, but sqrt(24) stays.
	'reduceCanceledRoots', // Turn sqrt(x^2) into x and root[n](x^n) into x.
	'turnRootsIntoFractionExponents', // Turn root[3](x) into x^(1/3).
	'turnFractionExponentsIntoRoots', // Turn x^(1/3) into root[3](x).
	'turnDegreeTwoRootsIntoSqrts', // Turn root[2](x) into sqrt(x).
	'turnSqrtsIntoDegreeTwoRoots', // Turn sqrt(x) into root[2](x). Conflicts with turnDegreeTwoRootsIntoSqrts.
	'expandRootsOfProducts', // Turn sqrt(x*y) into sqrt(x)*sqrt(y).
	'mergeProductsOfRoots', // Turn sqrt(x)*sqrt(y) into sqrt(x*y). Conflicts with expandRootsOfProducts.
	'pullExponentsIntoRoots', // Turn sqrt(4)^3 into sqrt(4^3).
	'pullFactorsOutOfRoots', // Turn sqrt(20) into 2*sqrt(5), and sqrt(a^3b^4c^5) into ab^2c^2*sqrt(ac).
	'preventRootDenominators', // Turn 1/sqrt(2) into sqrt(2)/2. Conficts with cancelFractionFactors.
]
export const allSimplificationOptions: ReadonlySet<typeof allSimplificationOptionsList[number]> = new Set(allSimplificationOptionsList)
