# Bernstein polynomials

This package is about describing Bernstein polynomials: those of the form `f(x) = [sum]_{i=0}^n c_i (n+1) * (n over i) * x^i * (1-x)^(n-i) = [sum]_{i=0}^n c_i * f_{i,n}(x)`. Note that the basis functions `f_{i,n}(x)` are not the conventional ones, but have been multiplied by the constant `(n+1)`. This is to ensure that the integral over a basis function always equals one.


## Fundamentals

Coefficients are described as an array of numbers: `[c_0, c_1, ..., c_n]`. These are the type `BernsteinCoefficients`. The following functions provide fundamental operations.

- `getBernsteinOrder(coefficients)` returns the order `n` of a coefficient array. This is the length minus one.
- `normalizeBernsteinCoefficients(coefficients)` normalizes a non-normalized coefficient array, ensuring the sum of the coefficients adds to one.
- `invertBernsteinCoefficients(coefficients)` inverts a coefficient array, reversing the order of the coefficients. If a set of coefficients describes a random variable `x`, then its inverse describes the random variable `y = 1-x`.


## Checks

To check if something is indeed a valid set of coefficients, we have the following functions.

- `ensureBernsteinCoefficients(coefficients, requireNormalized)` ensures that the received parameter is a valid coefficient array. If requireNormalized is true (default) then the coefficients should already be normalized. If anything is off, an error is thrown.
- `ensureBernsteinCoefficientSet(coefficientSet, requiredSkillIds)` makes sure that the provided object is a plain object whose parameters are coefficient arrays. If `requiredSkillIds` is given, as an array of strings, then only these skillIds are filtered out of the coefficient set, and they must all be present or an error is thrown.


## Moments

There are various moments of distributions that can be calculated.

- `getBernsteinExpectedValue(coefficients)` gives the expected value `E[x]` of the distribution.
- `getBernsteinVariance(coefficients)` gives the variance `E[(x-E[x])^2]` of the distribution.
- `getBernsteinMoment(coefficients, i)` gives the `i`th moment `E[x^i]` of the distribution.


## Distributions

From the coefficients, the complete distribution (that is, the PDF) can also be determined. This is done through the following functions.

- `getBernsteinPDF(coefficients)` returns a function `x => PDF(x)` that is the PDF of the distribution.
- `getBernsteinPDFDerivative(coefficients)` returns a function `x => dPDF(x)/dx` that is the derivative of the PDF of the distribution.
- `getBernsteinCDFCoefficients(coefficients)` returns coefficients that describe the CDF of the function described by the given coefficients.
- `getBernsteinCDF(coefficients)` returns a function `x => CDF(x)` that functions as integral of the PDF of the distribution.
- `getInverseBernsteinCDF(coefficients, numIterations = 20)` gives an inverse function `F => CDF^{-1}(F)` of the CDF. Since this is not an analytical function, the value is found through a binary search. The maximum number of iterations can be defined.
- `getBernsteinPDFMaximum(coefficients, numIterations = 20)` gives an object `{ x: number, f: number }` that denotes the point on the PDF with the maximum value (both the location `x` and the PDF value `f`). This is done by performing a binary search on the gradient, to see where it cross the zero value. It effectively assumes the PDF first ascend and then descends, which is usually (but not always) the case. As such, be careful when using this function.


## Smoothing

Bernstein coefficients can be "smoothed": their function becomes flatter. This is done through the following functions.

- `smoothBernsteinCoefficientsWithOrder(coefficients, order)` attempts to smooth the given coefficients to new coefficients of the given order.
- `smoothBernsteinCoefficientsWithFactor(coefficients, factor)` attempts to smooth the given coefficients by a factor. Here `0` means "unchanged" and `1` means "completely flattened. Successive smoothing steps may be used to apply smoothing that's close to the given order.


## Merging

There are two ways of merging Bernstein polynomials.

- `mergeBernsteinCoefficients(coefficients1, coefficients2, ...)` merges any number of Bernstein polynomials. The result corresponds to `f(x) = f_1(x) * f_2(x) * ...`. The order of the result is the sum of the orders of the individual coefficients.
- `mergeBernsteinCoefficientsElementwise(coefficients1, coefficients2, ...)` applies an element-wise multiplication on the coefficients. Coefficient lists must all be of the same order. This is needed in case of correlated skills.
