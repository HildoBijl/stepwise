# Bernstein polynomials

This package is about describing Bernstein polynomials: those of the form `f(x) = [sum]_{i=0}^n c_i (n+1) * (n over i) * x^i * (1-x)^(n-i) = [sum]_{i=0}^n c_i * f_{i,n}(x)`. Note that the basis functions `f_{i,n}(x)` are not the conventional ones, but have been multiplied by the constant `(n+1)`. This is to ensure that the integral over a basis function always equals one.


## Fundamentals

Coefficients are described as an array of numbers: `[c_0, c_1, ..., c_n]`. These are the type `BernsteinCoefficients`. The following functions provide fundamental operations.

`BernsteinCoefficients` is readonly to prevent accidental mutation. Functions in this package expect coefficient arrays to be non-empty, finite, non-negative and normalized. Validate data from APIs, databases or other untrusted sources with `ensureBernsteinCoefficients` before passing it to mathematical operations; internally created and previously validated coefficients can be reused without repeated checks.

- `getBernsteinDegree(coefficients)` returns the degree `n` of a coefficient array. This is the length minus one.
- `elevateBernsteinCoefficients(coefficients, newDegree)` rewrites the coefficients at a higher degree without changing the PDF.
- `normalizeBernsteinCoefficients(coefficients)` normalizes a non-normalized coefficient array, ensuring the sum of the coefficients adds to one.
- `reflectBernsteinCoefficients(coefficients)` reverses a coefficient array. If the coefficients describe a random variable `x`, the reflected coefficients describe `1-x`.


## Checks

To check if something is indeed a valid set of coefficients, we have the following functions.

- `ensureBernsteinCoefficients(coefficients, options?)` ensures that the received parameter is a valid coefficient array. Coefficients must be normalized by default; pass `{ requireNormalized: false }` to accept any positive total. Invalid input throws.


## Moments

There are various moments of distributions that can be calculated.

- `getBernsteinExpectedValue(coefficients)` gives the expected value `E[x]` of the distribution.
- `getBernsteinVariance(coefficients)` gives the variance `E[(x-E[x])^2]` of the distribution.
- `getBernsteinMoment(coefficients, exponent)` gives the corresponding moment `E[x^exponent]` of the distribution.


## Distributions

From the coefficients, the complete distribution (that is, the PDF) can also be determined. This is done through the following functions.

- `getBernsteinPDF(coefficients)` returns a function `x => PDF(x)` that is the PDF of the distribution.
- `getBernsteinPDFDerivative(coefficients)` returns a function `x => dPDF(x)/dx` that is the derivative of the PDF of the distribution.
- `getBernsteinCDFCoefficients(coefficients)` returns coefficients that describe the CDF of the function described by the given coefficients.
- `getBernsteinCDF(coefficients)` returns a function `x => CDF(x)` that functions as integral of the PDF of the distribution.
- `getBernsteinQuantileFunction(coefficients, options?)` returns the quantile function `probability => CDF^{-1}(probability)`. Values are approximated through binary search using 20 iterations by default; pass `{ iterations }` to change the budget.
- `getBernsteinPDFMaximum(coefficients, options?)` returns `{ x, density }` for a numerical approximation of the global PDF maximum. It uses Bernstein subdivision and coefficient bounds, with 20 iterations by default; pass `{ iterations }` to change the budget.


## Smoothing

Bernstein coefficients can be "smoothed": their function becomes flatter. This is done through the following functions.

- `smoothBernsteinCoefficientsToDegree(coefficients, degree)` attempts to smooth the given coefficients to new coefficients of the given degree.
- `smoothBernsteinCoefficientsWithRetentionFactor(coefficients, retentionFactor)` smooths by a retention factor. Here `1` leaves the distribution unchanged and `0` returns the uniform starting distribution.


## Merging

There are two ways of merging Bernstein polynomials.

- `multiplyBernsteinPDFs(coefficients1, coefficients2, ...)` multiplies any number of PDFs and normalizes the result. Its degree is the sum of the input degrees.
- `multiplyBernsteinCoefficientsElementwise(coefficients1, coefficients2, ...)` elevates coefficient arrays to the same degree, multiplies corresponding coefficients and normalizes the result. This is used for correlated distributions.
