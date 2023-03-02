# Tracking skill distributions through coefficients

When tracking skill distributions, we use linear combinations of beta distribution PDFs. To learn more about how this works, see the documentation on this in the [main skill tracking directory](../). This folder contains all functionalities related to it.


## Fundamentals

A coefficient array is an array `[c_0, c_1, c_2, ..., c_n]` of `n+1` coefficients, with `n` the order of the coefficient array. For such a coefficient array, there are a number of fundamental functions that come in handy.

- `ensureCoef(coef)` ensures that the received parameter is a valid normalized coefficient array. It is useful to check input. It may return a copy of the input.
- `getOrder(coef)` returns the order `n` of the coefficient array. This is the length minus one.
- `normalize(coef)` normalizes a non-normalized coefficient array, ensuring the sum of the coefficients adds to one.
- `invert(coef)` inverts a coefficient array, reversing the order of the coefficients. If a set of coefficients describes a random variable `x`, then its inverse describes the random variable `y = 1-x`.

Next to functions for coefficients, there are also two functions for coefficient sets. A coefficient set is an object `{ someSkill1: [...], someSkill2: [...] }` whose properties are coefficient arrays.

- `ensureCoefSet(coefSet, requiredSkillIds)` makes sure that the provided object is a valid coefficient set with valid coefficient arrays. If `requiredSkillIds` is given, as an array of strings, then only these skillIds are filtered out of the coefficient set, and they must all be present or an error is thrown.
- `getCoef(coefSet, skillId)` takes a coefficient set and gets the coefficients with the given `skillId`, checking that they are valid before returning them. If `ensureCoefSet` has been called, this is not needed anymore, since `ensureCoefSet` has already checked the coefficients. In this case `coefSet[skillId]` is sufficient to use.


## Moments

There are various moments of distributions that can be calculated.

- `getEV(coef)` gives the expected value `E[x]` of the distribution.
- `getVariance(coef)` gives the variance `E[(x-E[x])^2]` of the distribution.
- `getMoment(coef, i)` gives the `i`th moment `E[x^i]` of the distribution.


## Distributions

From the coefficients, the complete distribution (that is, the PDF) can also be determined. This is done through the following functions.

- `getPDF(coef)` returns a function `x => PDF(x)` that is the PDF of the distribution.
- `getPDFDerivative(coef)` returns a function `x => dPDF(x)/dx` that is the derivative of the PDF of the distribution.
- `getMaxLikelihood(coef, numIterations = 20)` gives an object `{ x: number, f: number }` that denotes the point on the PDF with the maximum likelihood (both the location `x` and the PDF value `f`). This is done by performing a binary search on the gradient, to see where it cross the zero value. It effectively assumes the PDF first ascend and then descends, which is usually (but not always) the case. As such, be careful when using this function.


## Smoothing

Distributions often need to be smoothened when being processed. This is done through various smoothing functions. The most common one is the following.

- `smoothen(coef, factor)` takes a coefficient array and smoothens its distribution by a given factor. A factor of 1 leaves the distribution unchanged, while 0 brings it back to the starting distribution. Effectively, the new mean is (0.5 * (mu_old - 0.5) * factor).

To first determine and then apply the factor, there are two other functions.

- `getSmoothingFactor(options)` returns a smoothing factor that is appropriate to apply given the situation. The situation is described in the options, with three (all optional) properties.
	- `time` (default `0`) is the time passed since the skill was last practiced.
	- `applyPracticeDecay` (default `false`) will (when set to `true`) lower the amount of smoothing applied because the user practiced the skill one more time. If not, this amount of smoothing remains the same.
	- `numProblemsPracticed` (default `0`) indices the number of times the student has practiced the problem, used by the practice decay.

	Next to these situation settings, it is also possible to override general site-wide settings, set in the [skill tracking settings](../settings.js).
	- `decayHalfLife` [milliseconds] is the time after which half of the convergence towards the flat distribution is obtained.
	- `initialPracticeDecayTime` [milliseconds] is the equivalent time of decay for practicing a problem.
	- `practiceDecayHalfLife` [problems practiced] is the number of problems practiced until the practice decay halves.

- `smoothenWithOrder(coef, newOrder)` applies smoothing with a given smoothing order.


## Merging

Often multiple distributions need to be merged. This effectively multiplies the PDFs and normalizes the results. That is, `f_merged(x)` is proportional to `f_1(x) * f_2(x)`. To do so, we have the following functions.

- `mergeTwo(coef1, coef2)` merges two distributions. The result is a new set of coefficients.
- `merge(coefs)` merges any number of distributions, receiving an array of coefficient arrays. The result is a new set of coefficients.
- `mergeElementwise(coefs)` applies an element-wise multiplication among coefficients. This is needed in case of correlated skills. The given coefficient arrays must have the same order. The result is a new set of coefficients.
