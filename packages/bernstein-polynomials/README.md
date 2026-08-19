# @step-wise/bernstein-polynomials

`@step-wise/bernstein-polynomials` provides JavaScript and TypeScript utilities for representing probability distributions on the unit interval with Bernstein coefficients. It supports evaluation, moments, degree elevation, reflection, smoothing and multiplication of distributions.

A coefficient array `[c_0, c_1, ..., c_n]` represents the probability density `f(x) = (n + 1) * sum(c_i * binomial(n, i) * x^i * (1 - x)^(n - i))`. The factor `n + 1` makes every basis density integrate to one, so a non-negative coefficient array whose values sum to one represents a normalized probability distribution.


## Installation

```bash
npm install @step-wise/bernstein-polynomials
```


## Quick start

Import all public functions and types from the package root.

```ts
import { getBernsteinExpectedValue, getBernsteinPDF, getBernsteinQuantileFunction, reflectBernsteinCoefficients } from '@step-wise/bernstein-polynomials'

const coefficients = [0.1, 0.2, 0.7] as const
const pdf = getBernsteinPDF(coefficients)
const quantile = getBernsteinQuantileFunction(coefficients)

pdf(0.5) // 0.9
getBernsteinExpectedValue(coefficients) // approximately 0.65
quantile(0.5) // the median, approximated numerically
reflectBernsteinCoefficients(coefficients) // [0.7, 0.2, 0.1]
```


## Coefficients and validation

The exported `BernsteinCoefficients` type is `readonly number[]`. Mathematical operations expect coefficient arrays to be non-empty, finite, non-negative and normalized. Functions do not repeatedly validate trusted coefficient arrays, so use `ensureBernsteinCoefficients` when values originate outside the application or are otherwise untrusted.

### `ensureBernsteinCoefficients(coefficients, options?)`

Validates an unknown value and returns a copied coefficient array. Coefficients must be normalized by default. Pass `{ requireNormalized: false }` to accept a non-empty, non-negative coefficient array with any total.

```ts
ensureBernsteinCoefficients([0.2, 0.3, 0.5]) // [0.2, 0.3, 0.5]
ensureBernsteinCoefficients([2, 3, 5], { requireNormalized: false }) // [2, 3, 5]
ensureBernsteinCoefficients([1, 1]) // throws
```

Small floating-point deviations from a total of one are accepted. Invalid types produce a `TypeError`, while invalid ranges and shapes generally produce a `RangeError` or `Error`.


## Fundamental operations

### `getBernsteinDegree(coefficients)`

Returns the polynomial degree, equal to the coefficient count minus one. An empty array is rejected.

### `elevateBernsteinCoefficients(coefficients, newDegree)`

Rewrites a distribution at a higher degree without changing its PDF. The new degree must be a non-negative safe integer at least as large as the current degree.

```ts
elevateBernsteinCoefficients([0, 1], 2) // [0, 1 / 3, 2 / 3]
```

### `normalizeBernsteinCoefficients(coefficients)`

Returns coefficients whose values sum to one. Negative values are first clipped to zero to guard against numerical noise. An array without any positive value cannot be normalized and is rejected.

### `reflectBernsteinCoefficients(coefficients)`

Reverses the coefficients without mutating the input. If the original distribution describes `X`, the reflected coefficients describe `1 - X`.


## Moments

### `getBernsteinMoment(coefficients, exponent)`

Returns the raw moment `E[X^exponent]`. The exponent must be a non-negative safe integer; an exponent of zero returns one for a normalized distribution.

### `getBernsteinExpectedValue(coefficients)`

Returns the expected value `E[X]`.

### `getBernsteinVariance(coefficients)`

Returns the variance `E[X^2] - E[X]^2`.

```ts
getBernsteinExpectedValue([0, 1]) // 2 / 3
getBernsteinVariance([0, 1]) // 1 / 18
```


## Distribution functions

### `getBernsteinPDF(coefficients)`

Returns a function that evaluates the probability density. The returned function accepts finite numbers and infinities, and returns zero outside `[0, 1]`.

### `getBernsteinPDFDerivative(coefficients)`

Returns a function that evaluates the derivative of the PDF. It returns zero outside `[0, 1]`, as well as everywhere for a degree-zero distribution.

### `getBernsteinCDF(coefficients)`

Returns a function that evaluates the cumulative distribution. It returns zero below the unit interval and one above it.

```ts
const cdf = getBernsteinCDF([1])

cdf(0.25) // 0.25
cdf(-Infinity) // 0
cdf(Infinity) // 1
```

### `getBernsteinQuantileFunction(coefficients, options?)`

Returns a function mapping a probability in `[0, 1]` to its approximate quantile. The inverse is found through binary search using 20 iterations by default. Pass `{ iterations }` with a positive safe integer to control the precision and calculation cost. Probabilities zero and one return the corresponding endpoints exactly.

### `getBernsteinPDFMaximum(coefficients, options?)`

Returns an approximate global maximum as `{ x, density }`. The calculation uses Bernstein subdivision and coefficient bounds rather than sampling only predetermined points. It performs 20 iterations by default; pass `{ iterations }` with a positive safe integer to change the search budget.

```ts
getBernsteinPDFMaximum([0, 1, 0]) // approximately { x: 0.5, density: 1.5 }
```


## Smoothing

### `smoothBernsteinCoefficientsToDegree(coefficients, degree)`

Smooths a distribution to the requested non-negative degree and returns normalized coefficients. For numerical stability, requested degrees above `maxBernsteinSmoothingDegree` are capped at that exported limit.

### `smoothBernsteinCoefficientsWithRetentionFactor(coefficients, retentionFactor)`

Smooths a distribution according to a retention factor from zero through one. A factor of one leaves the distribution unchanged, while zero returns the uniform degree-zero distribution `[1]`. High-degree inputs may be smoothed automatically to remain computationally manageable.

The exported constants `maxBernsteinDegreeBeforeSmoothing` and `maxBernsteinSmoothingDegree` describe the automatic-smoothing threshold and numerical degree cap.


## Multiplying distributions

### `multiplyBernsteinPDFs(...coefficientsList)`

Multiplies the represented PDFs and normalizes the product. The resulting degree is the sum of the input degrees. With no arguments it returns `[1]`; with one argument it returns that coefficient array unchanged.

```ts
multiplyBernsteinPDFs([0, 1], [1, 0]) // [0, 1, 0]
```

### `multiplyBernsteinCoefficientsElementwise(...coefficientsList)`

Elevates all inputs to the highest supplied degree, multiplies corresponding coefficients and normalizes the result. This operation is useful when combining correlated evidence and is mathematically different from multiplying the represented PDFs.

```ts
multiplyBernsteinCoefficientsElementwise([0.2, 0.8], [0.8, 0.2]) // [0.5, 0.5]
```

Multiplication rejects a product that cannot be normalized because every resulting coefficient is zero.


## TypeScript

The package includes TypeScript declarations and accepts readonly coefficient arrays throughout. It exports the `BernsteinCoefficients`, `EnsureBernsteinCoefficientsOptions`, `BernsteinApproximationOptions` and `BernsteinPDFMaximum` types alongside its functions and smoothing constants.
