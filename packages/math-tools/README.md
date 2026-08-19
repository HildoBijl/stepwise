# @step-wise/math-tools

`@step-wise/math-tools` provides focused JavaScript and TypeScript utilities for prime numbers, divisors, perfect powers, combinatorics and the normal probability distribution. Its integer functions validate their inputs as safe JavaScript integers and use explicit behavior for mathematical boundary cases.


## Installation

```bash
npm install @step-wise/math-tools
```


## Quick start

Import public utilities from the package root.

```ts
import { binomialCoefficient, gcd, getPrimeFactorization, isPerfectSquare, normalPDF } from '@step-wise/math-tools'

gcd(84, 30) // 6
getPrimeFactorization(360) // [{ prime: 2, exponent: 3 }, { prime: 3, exponent: 2 }, { prime: 5, exponent: 1 }]
isPerfectSquare(144) // true
binomialCoefficient(5, 2) // 10
normalPDF(0) // approximately 0.3989422804
```


## Prime numbers

### `getPrimeByIndex(index)`

Returns the prime at a zero-based index. For example, indices `0`, `1` and `2` return `2`, `3` and `5` respectively. Primes are generated and cached as needed.

### `isPrime(number)`

Checks whether a positive safe integer is prime. `1` returns `false`; zero and negative numbers are rejected so that unintended inputs are not silently treated as non-prime.

### `getPrimeFactorization(number)`

Returns the prime factorization of a positive safe integer as `PrimeFactorizationEntry[]`, where every entry has a `prime` and an `exponent`. Factors are ordered from smallest to largest.

```ts
getPrimeFactorization(1) // []
getPrimeFactorization(72) // [{ prime: 2, exponent: 3 }, { prime: 3, exponent: 2 }]
```


## Divisors

### `gcd(...numbers)`

Returns the non-negative greatest common divisor of one or more safe integers. Signs are ignored, zero is supported and `gcd(0, 0)` returns `0`.

```ts
gcd(-48, 18) // 6
gcd(35, 64) // 1
```

### `lcm(...numbers)`

Returns the non-negative least common multiple of one or more safe integers. Signs are ignored, and the result is `0` when any input is zero.

```ts
lcm(-4, 6) // 12
lcm(4, 6, 10) // 60
```

Both functions require at least one argument.


## Perfect powers

### `isPerfectPower(number, exponent)`

Checks whether an integer is an exact integer power with the given non-negative integer exponent. Every integer is a first power, only `1` is treated as a zeroth power, and negative numbers can only be perfect powers for odd exponents.

```ts
isPerfectPower(64, 3) // true
isPerfectPower(-125, 3) // true
isPerfectPower(-64, 2) // false
```

### `isPerfectSquare(number)`

Checks whether an integer is a perfect square. It is equivalent to `isPerfectPower(number, 2)`.

### `getLargestPerfectPowerDivisor(number, exponent)`

Returns the largest divisor of a positive safe integer that is itself a perfect power with the requested positive exponent.

```ts
getLargestPerfectPowerDivisor(72, 2) // 36
getLargestPerfectPowerDivisor(432, 3) // 216
getLargestPerfectPowerDivisor(13, 2) // 1
```


## Combinatorics

### `factorial(n)`

Returns `n!` for a non-negative safe integer. Values are cached and `factorial(0)` returns `1`.

```ts
factorial(5) // 120
```

### `binomialCoefficient(n, k)`

Returns the binomial coefficient “n choose k” for non-negative safe integers with `n >= k`. The calculation uses the symmetry between `k` and `n - k` and does not calculate complete factorials.

```ts
binomialCoefficient(5, 2) // 10
binomialCoefficient(20, 17) // 1140
```


## Probability distributions

### `normalPDF(x, mean?, standardDeviation?)`

Returns the probability density of a normal distribution at `x`. The mean defaults to `0` and the standard deviation defaults to `1`. The standard deviation must be finite and strictly positive; `x` may be positive or negative infinity, in which case the result is `0`.

```ts
normalPDF(0) // approximately 0.3989422804
normalPDF(10, 10, 2) // approximately 0.1994711402
normalPDF(Infinity) // 0
```


## Validation and numerical limits

Integer utilities accept numbers only and require safe integers, preventing calculations from starting with imprecisely represented integer inputs. Invalid types produce a `TypeError`, while values outside a function's accepted range generally produce a `RangeError`.

Results still use JavaScript's `number` type. Large factorials, ratios, coefficients, least common multiples and powers can therefore lose integer precision or overflow to `Infinity`. Use a big-integer or arbitrary-precision library when exact results outside the JavaScript number range are required.


## TypeScript

The package includes TypeScript declarations. `PrimeFactorizationEntry` is exported for consumers that need to store or process the sparse result returned by `getPrimeFactorization`.
