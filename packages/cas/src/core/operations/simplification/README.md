# Simplification engine

The simplification engine rewrites an expression tree with an explicitly selected set of rules. It validates the selected rules, resolves their stages and repeatedly applies each stage until the tree stabilizes.


## Rule model

Rules are defined with `defineRule`. Each rule contains:

- a unique `name`, which becomes its public simplification option;
- an `appliesTo` type guard;
- a `transform` that returns an equivalent node;
- optional `requires`, `conflictsWith` and `after` relationships.

`requires` describes rules that must be selected together. `conflictsWith` prevents combinations that could be contradictory or fail to stabilize. `after` controls staging: the later rule is introduced only after the earlier selected rules have had a complete stabilization stage.

Rules are grouped by transformation purpose under [`rules`](./rules): structural, numeric, cancellation, combination, expansion, rewriting, normalization and factorization. Folder placement describes what the rule does, not only which node subtype it targets.


## Execution

`simplify` resolves option names to registered rules and validates their relationships. For each resolved cumulative stage it:

1. traverses the tree children-first;
2. offers every node to the selected rules in registry order;
3. recreates changed parents;
4. repeats until a full pass returns the same root reference.

The process throws after twenty changing passes. Hitting that guard generally means two rules rewrite back and forth or a rule recreates an unchanged node unnecessarily.

The `SimplificationContext` supplies resolved expression settings, parent nodes, the active rule set and a recursive simplifier. A rule should use the context rather than starting an unrelated simplification with different settings.


## Presets

Presets are named rule sets in [`simplificationOptions/simplificationPresets.ts`](./simplificationOptions/simplificationPresets.ts). The wrapper methods `flatten`, `removeTrivial`, `mergeNumbers`, `cancel`, `combine`, `expand`, `sort`, `normalize`, `factorize` and `format` apply these sets.

Wrapper calls may provide one collection of rules to add and another to remove. The resulting set is still validated, so removing a required rule or introducing a conflict throws.


## Adding a rule

1. Add the rule to the folder matching its transformation purpose.
2. Register and export it through that folder's `index.ts`; duplicate names are rejected.
3. Declare requirements, conflicts and staging constraints with rule references rather than repeated names.
4. Add focused tests for branching and boundary cases.
5. Add integration coverage under `core/tests/integration/simplification` when the rule interacts with other rules or presets.
6. Add the rule to the reference table below and to a preset only when it belongs in that preset's intended behavior.

Transforms must preserve mathematical meaning and should return the input node when no change is needed.


## Rule reference

The table below lists all available simplification options. It is ordered by node type for lookup, while the category column indicates the rule's folder under [`rules`](./rules).

| Node type | Option | Category | Description |
|---|---|---|---|
| Sign | `removeSignsFromZero` | Numeric | Turns `-0` and `±0` into `0`. |
| Sign | `removeDoubleNegatives` | Numeric | Turns `-(-x)` into `x`. |
| Sign | `removeDoubleSigns` | Numeric | Turns `±±x` into `±x`, and both `-±x` and `±-x` into `±x`. |
| Constant | `convertIntegerFloatsToIntegers` | Numeric | Turns floats into integers whenever possible; for example, a result of `3.0` becomes `3`. |
| Constant | `factorizeIntegers` | Factorization | Turns integers into their prime factorizations; for example, `12` becomes `2^2*3`. |
| Sum | `flattenSums` | Structural | Turns `x+(y+z)` into `x+y+z`. |
| Sum | `removeZeroesFromSums` | Cancellation | Removes `+0` from sums. |
| Sum | `combineNumbersInSums` | Numeric | Groups numbers in sums; for example, `2+3*x+4` becomes `6+3*x`. |
| Sum | `cancelSumTerms` | Cancellation | Cancels matching terms in sums; for example, `2x+3y-2x` becomes `3y`. |
| Sum | `combineLikeTerms` | Combination | Groups like sum terms; for example, `2*x+3*x` becomes `(2+3)*x`, and then `5*x`. |
| Sum | `expandMinusSums` | Expansion | Turns `-(x-y)` into `-x-(-y)`. |
| Sum | `expandPlusMinusSums` | Expansion | Turns `±(x-y)` into `±x±(-y)`. |
| Sum | `factorCommonNumericTerms` | Factorization | Pulls common leading numbers outside sums; for example, `6x+9y` becomes `3(2x+3y)`. |
| Sum | `factorCommonFactors` | Factorization | Pulls common factors outside sums; for example, `x^3*(y+1)*z+x^2*(y+1)^3*w` becomes `x^2*(y+1)*(xz+(y+1)^2*w)`. |
| Sum | `sortSums` | Normalization | Sorts terms in sums, putting simpler terms first. |
| Product | `flattenProducts` | Structural | Turns `x*(y*z)` into `x*y*z`. |
| Product | `combineMinusSignsInProducts` | Numeric | Reduces negative numbers in products; for example, `-2*x*-3*-1*4` becomes `-2*x*3*1*4`. |
| Product | `combinePlusMinusSignsInProducts` | Numeric | Pulls plus/minus symbols to the front of products and merges them. |
| Product | `simplifyZeroProducts` | Cancellation | Turns any product containing a factor `0` into `0`. |
| Product | `removeOnesFromProducts` | Cancellation | Removes factors equal to `1` from products. |
| Product | `combineNumbersInProducts` | Numeric | Groups numbers in products; for example, `2*x*3*y*4*z` becomes `24*x*y*z`. Numbers are placed at the start. |
| Product | `combineLikeFactors` | Combination | Merges equal product factors into powers; for example, `x*x^2` becomes `x^3`. |
| Product | `expandProductsOfSums` | Expansion | Turns `a*(b+c)` into `a*b+a*c`. |
| Product | `sortProducts` | Normalization | Sorts factors in products, putting simpler factors first. |
| Fraction | `simplifyZeroNumeratorFractions` | Cancellation | Turns `0/x` into `0`. |
| Fraction | `simplifyUnitDenominatorFractions` | Cancellation | Turns `x/1` into `x` and `x/(-1)` into `-x`. |
| Fraction | `combineProductFractions` | Combination | Turns products of fractions into one fraction; for example, `a*(b/c)` becomes `ab/c`. |
| Fraction | `flattenFractions` | Rewriting | Flattens nested fractions; for example, `(a/b)/(c/d)` becomes `ad/bc`. |
| Fraction | `combineNumericFractionsInSums` | Combination | Merges numeric fractions within sums; for example, `1/2+x+1/3` becomes `(3+2)/(2*3)+x`. |
| Fraction | `combineSumFractions` | Combination | Turns sums of fractions into one fraction; for example, `a/b+c/d` becomes `(ad+bc)/(bd)`. |
| Fraction | `splitFractions` | Expansion | Splits fractions over numerator sums; for example, `(a+b)/c` becomes `a/c+b/c`. |
| Fraction | `combineMinusSignsInFractions` | Numeric | Turns `-x/-y` into `x/y`, `(-x)/y` into `-(x/y)`, and `x/(-y)` into `-(x/y)`. |
| Fraction | `factorMinusSignsOutOfFractionSums` | Numeric | Pulls minuses out of numerator or denominator sums whose terms are all negative; for example, `1/(-2-3x)` becomes `-(1/(2+3x))`. |
| Fraction | `combineNumbersInFractions` | Numeric | Reduces leading numbers in fractions by their GCD; for example, `18/12` becomes `3/2` and `(18x+24y)/(12z)` becomes `(3x+4y)/(2z)`. |
| Fraction | `cancelFractionFactors` | Cancellation | Cancels exactly matching factors in fractions; for example, `(xy)/(yz)` becomes `x/z`. It also handles matching factors in sums. |
| Fraction | `combineFractionFactors` | Combination | Merges powers of matching fraction factors; for example, `x^a/x^b` becomes `x^(a-b)`. It also handles factors shared by sum terms. |
| Fraction | `normalizeFractionSigns` | Normalization | Ensures that the first term in a numerator or denominator does not carry a minus sign. |
| Fraction | `cancelPolynomialFactors` | Normalization | Cancels polynomial factors between a numerator and denominator. Currently supports univariate polynomials. |
| Power | `simplifyZeroExponentPowers` | Cancellation | Turns `x^0` into `1`. |
| Power | `simplifyZeroBasePowers` | Cancellation | Turns `0^x` into `0`. |
| Power | `simplifyUnitExponentPowers` | Cancellation | Turns `x^1` into `x`. |
| Power | `simplifyUnitBasePowers` | Cancellation | Turns `1^x` into `1`. |
| Power | `combineMinusSignsInPowers` | Numeric | Reduces `(-x)^n` for integer `n` to either `x^n` or `-x^n`. |
| Power | `evaluateNumericPowers` | Numeric | Evaluates numeric powers; for example, `3^2` becomes `9`. It also simplifies numeric components of fractional exponents. |
| Power | `flattenNestedPowers` | Rewriting | Turns `(a^b)^c` into `a^(b*c)`. |
| Power | `rewriteNegativePowersAsFractions` | Rewriting | Turns `x^-2` into `1/x^2`. |
| Power | `expandPowers` | Expansion | Turns `a^3` into `a*a*a`. |
| Power | `expandPowersOfProducts` | Expansion | Turns `(a*b)^n` into `a^n*b^n`. |
| Power | `expandPowersOfFractions` | Expansion | Turns `(a/b)^n` into `a^n/b^n`. |
| Power | `expandPowersOfSums` | Expansion | Expands integer powers of sums; for example, `(a+b)^3` becomes `a^3+3*a^2*b+3*a*b^2+b^3`. |
| Root | `simplifyZeroRadicandRoots` | Cancellation | Turns `sqrt(0)` and other roots of `0` into `0`. |
| Root | `simplifyUnitRadicandRoots` | Cancellation | Turns `sqrt(1)` and other roots of `1` into `1`. |
| Root | `simplifyUnitDegreeRoots` | Cancellation | Turns `root[1](x)` into `x`. |
| Root | `evaluateNumericRoots` | Numeric | Evaluates exact numeric roots; for example, `sqrt(25)` becomes `5`, while `sqrt(24)` remains unchanged. It also updates reducible floats. |
| Root | `cancelMatchingRootsAndPowers` | Cancellation | Turns `sqrt(x^2)` into `x` and `root[n](x^n)` into `x`. |
| Root | `rewriteRootsAsFractionalPowers` | Rewriting | Turns `root[3](x)` into `x^(1/3)`. |
| Root | `rewriteFractionalPowersAsRoots` | Rewriting | Turns `x^(1/3)` into `root[3](x)`. |
| Root | `rewriteSquareRootsAsSqrts` | Rewriting | Turns `root[2](x)` into `sqrt(x)`. |
| Root | `rewriteSqrtsAsSquareRoots` | Rewriting | Turns `sqrt(x)` into `root[2](x)`. |
| Root | `expandRootsOfProducts` | Expansion | Turns `sqrt(x*y)` into `sqrt(x)*sqrt(y)`. |
| Root | `combineRootsInProducts` | Combination | Turns `sqrt(x)*sqrt(y)` into `sqrt(x*y)`, for roots with equal degrees. |
| Root | `combineProductsWithRoots` | Combination | Turns `x*sqrt(y)` into `sqrt(x^2*y)`, merging all factors into one root. |
| Root | `moveExponentsIntoRoots` | Combination | Turns `sqrt(4)^3` into `sqrt(4^3)`. |
| Root | `reduceRootPowerExponents` | Cancellation | Turns `root[xy](z^x)` into `root[y](z)`. |
| Root | `extractFactorsFromRoots` | Factorization | Turns `sqrt(20)` into `2*sqrt(5)` and `sqrt(a^3b^4c^5)` into `ab^2c^2*sqrt(ac)`. |
| Root | `rationalizeRootDenominators` | Normalization | Rationalizes root denominators; for example, `1/sqrt(2)` becomes `sqrt(2)/2`. |
| Logarithm | `simplifyUnitArgumentLogarithms` | Cancellation | Turns `log(1)` into `0`. |
| Logarithm | `simplifyBaseArgumentLogarithms` | Cancellation | Turns `log[b](b)` into `1`. |
