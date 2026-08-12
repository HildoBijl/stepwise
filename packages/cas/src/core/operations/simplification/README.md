# Simplification options

The table below lists all available simplification options. It is ordered by the node type under which the rules were historically grouped. The category column indicates the rule's current folder under [`rules`](./rules).

| Node type | Option | Category | Description |
|---|---|---|---|
| Sign | `removeSignsFromZeros` | Numeric | Turns `-0` and `±0` into `0`. |
| Sign | `removeDoubleNegatives` | Numeric | Turns `-(-x)` into `x`. |
| Sign | `removeDoubleSigns` | Numeric | Turns `±±x` into `±x`, and both `-±x` and `±-x` into `±x`. |
| Constant | `turnFloatsIntoIntegers` | Numeric | Turns floats into integers whenever possible; for example, a result of `3.0` becomes `3`. |
| Constant | `factorizeIntegers` | Factorization | Turns integers into their prime factorizations; for example, `12` becomes `2^2*3`. |
| Sum | `flattenSums` | Structural | Turns `x+(y+z)` into `x+y+z`. |
| Sum | `removeZeroesFromSums` | Cancellation | Removes `+0` from sums. |
| Sum | `mergeSumNumbers` | Numeric | Groups numbers in sums; for example, `2+3*x+4` becomes `6+3*x`. |
| Sum | `cancelSumTerms` | Cancellation | Cancels matching terms in sums; for example, `2x+3y-2x` becomes `3y`. |
| Sum | `groupSumTerms` | Combination | Groups like sum terms; for example, `2*x+3*x` becomes `(2+3)*x`, and then `5*x`. |
| Sum | `expandMinusSums` | Expansion | Turns `-(x-y)` into `-x-(-y)`. |
| Sum | `expandPlusMinusSums` | Expansion | Turns `±(x-y)` into `±x±(-y)`. |
| Sum | `pullOutCommonSumNumbers` | Factorization | Pulls common leading numbers outside sums; for example, `6x+9y` becomes `3(2x+3y)`. |
| Sum | `pullOutCommonSumFactors` | Factorization | Pulls common factors outside sums; for example, `x^3*(y+1)*z+x^2*(y+1)^3*w` becomes `x^2*(y+1)*(xz+(y+1)^2*w)`. |
| Sum | `sortSums` | Normalization | Sorts terms in sums, putting simpler terms first. |
| Product | `flattenProducts` | Structural | Turns `x*(y*z)` into `x*y*z`. |
| Product | `mergeProductMinuses` | Numeric | Reduces negative numbers in products; for example, `-2*x*-3*-1*4` becomes `-2*x*3*1*4`. |
| Product | `mergeProductPlusMinuses` | Numeric | Pulls plus/minus symbols to the front of products and merges them. |
| Product | `reduceProductsWithZero` | Cancellation | Turns any product containing a factor `0` into `0`. |
| Product | `removeOnesFromProducts` | Cancellation | Removes factors equal to `1` from products. |
| Product | `mergeProductNumbers` | Numeric | Groups numbers in products; for example, `2*x*3*y*4*z` becomes `24*x*y*z`. Numbers are placed at the start. |
| Product | `mergeProductFactors` | Combination | Merges equal product factors into powers; for example, `x*x^2` becomes `x^3`. |
| Product | `expandProductsOfSums` | Expansion | Turns `a*(b+c)` into `a*b+a*c`. |
| Product | `sortProducts` | Normalization | Sorts factors in products, putting simpler factors first. |
| Fraction | `reduceFractionsWithZeroNumerator` | Cancellation | Turns `0/x` into `0`. |
| Fraction | `reduceFractionsWithOneDenominator` | Cancellation | Turns `x/1` into `x` and `x/(-1)` into `-x`. |
| Fraction | `mergeFractionProducts` | Combination | Turns products of fractions into one fraction; for example, `a*(b/c)` becomes `ab/c`. |
| Fraction | `flattenFractions` | Rewriting | Flattens nested fractions; for example, `(a/b)/(c/d)` becomes `ad/bc`. |
| Fraction | `mergeNumericFractionSums` | Combination | Merges numeric fractions within sums; for example, `1/2+x+1/3` becomes `(3+2)/(2*3)+x`. |
| Fraction | `mergeFractionSums` | Combination | Turns sums of fractions into one fraction; for example, `a/b+c/d` becomes `(ad+bc)/(bd)`. |
| Fraction | `splitFractions` | Expansion | Splits fractions over numerator sums; for example, `(a+b)/c` becomes `a/c+b/c`. |
| Fraction | `mergeFractionMinuses` | Numeric | Turns `-x/-y` into `x/y`, `(-x)/y` into `-(x/y)`, and `x/(-y)` into `-(x/y)`. |
| Fraction | `mergeFractionSumMinuses` | Numeric | Pulls minuses out of numerator or denominator sums whose terms are all negative; for example, `1/(-2-3x)` becomes `-(1/(2+3x))`. |
| Fraction | `mergeFractionNumbers` | Numeric | Reduces leading numbers in fractions by their GCD; for example, `18/12` becomes `3/2` and `(18x+24y)/(12z)` becomes `(3x+4y)/(2z)`. |
| Fraction | `cancelFractionFactors` | Cancellation | Cancels exactly matching factors in fractions; for example, `(xy)/(yz)` becomes `x/z`. It also handles matching factors in sums. |
| Fraction | `mergeFractionFactors` | Combination | Merges powers of matching fraction factors; for example, `x^a/x^b` becomes `x^(a-b)`. It also handles factors shared by sum terms. |
| Fraction | `normalizeFractionMinuses` | Normalization | Ensures that the first term in a numerator or denominator does not carry a minus sign. |
| Fraction | `applyPolynomialCancellation` | Normalization | Cancels polynomial factors between a numerator and denominator. Currently supports univariate polynomials. |
| Power | `reducePowersWithZeroExponent` | Cancellation | Turns `x^0` into `1`. |
| Power | `reducePowersWithZeroBase` | Cancellation | Turns `0^x` into `0`. |
| Power | `removeOneExponentsFromPowers` | Cancellation | Turns `x^1` into `x`. |
| Power | `reducePowersWithOneBase` | Cancellation | Turns `1^x` into `1`. |
| Power | `mergePowerMinuses` | Numeric | Reduces `(-x)^n` for integer `n` to either `x^n` or `-x^n`. |
| Power | `reduceNumberPowers` | Numeric | Evaluates numeric powers; for example, `3^2` becomes `9`. It also simplifies numeric components of fractional exponents. |
| Power | `removePowersWithinPowers` | Rewriting | Turns `(a^b)^c` into `a^(b*c)`. |
| Power | `convertNegativePowers` | Rewriting | Turns `x^-2` into `1/x^2`. |
| Power | `expandPowers` | Expansion | Turns `a^3` into `a*a*a`. |
| Power | `expandPowersOfProducts` | Expansion | Turns `(a*b)^n` into `a^n*b^n`. |
| Power | `expandPowersOfFractions` | Expansion | Turns `(a/b)^n` into `a^n/b^n`. |
| Power | `expandPowersOfSums` | Expansion | Expands integer powers of sums; for example, `(a+b)^3` becomes `a^3+3*a^2*b+3*a*b^2+b^3`. |
| Root | `reduceRootsWithZeroRadicand` | Cancellation | Turns `sqrt(0)` and other roots of `0` into `0`. |
| Root | `reduceRootsWithOneRadicand` | Cancellation | Turns `sqrt(1)` and other roots of `1` into `1`. |
| Root | `reduceRootsWithOneDegree` | Cancellation | Turns `root[1](x)` into `x`. |
| Root | `reduceNumberRoots` | Numeric | Evaluates exact numeric roots; for example, `sqrt(25)` becomes `5`, while `sqrt(24)` remains unchanged. It also updates reducible floats. |
| Root | `reduceCanceledRoots` | Cancellation | Turns `sqrt(x^2)` into `x` and `root[n](x^n)` into `x`. |
| Root | `turnRootsIntoFractionExponents` | Rewriting | Turns `root[3](x)` into `x^(1/3)`. |
| Root | `turnFractionExponentsIntoRoots` | Rewriting | Turns `x^(1/3)` into `root[3](x)`. |
| Root | `turnDegreeTwoRootsIntoSqrts` | Rewriting | Turns `root[2](x)` into `sqrt(x)`. |
| Root | `turnSqrtsIntoDegreeTwoRoots` | Rewriting | Turns `sqrt(x)` into `root[2](x)`. |
| Root | `expandRootsOfProducts` | Expansion | Turns `sqrt(x*y)` into `sqrt(x)*sqrt(y)`. |
| Root | `mergeProductsOfRoots` | Combination | Turns `sqrt(x)*sqrt(y)` into `sqrt(x*y)`, for roots with equal degrees. |
| Root | `mergeProductsWithRoots` | Combination | Turns `x*sqrt(y)` into `sqrt(x^2*y)`, merging all factors into one root. |
| Root | `pullExponentsIntoRoots` | Combination | Turns `sqrt(4)^3` into `sqrt(4^3)`. |
| Root | `reducePowersInRoots` | Cancellation | Turns `root[xy](z^x)` into `root[y](z)`. |
| Root | `pullFactorsOutOfRoots` | Factorization | Turns `sqrt(20)` into `2*sqrt(5)` and `sqrt(a^3b^4c^5)` into `ab^2c^2*sqrt(ac)`. |
| Root | `preventRootDenominators` | Normalization | Rationalizes root denominators; for example, `1/sqrt(2)` becomes `sqrt(2)/2`. |
| Logarithm | `reduceLogarithmsWithOneArgument` | Cancellation | Turns `log(1)` into `0`. |
| Logarithm | `reduceLogarithmsWithBaseArgument` | Cancellation | Turns `log[b](b)` into `1`. |
