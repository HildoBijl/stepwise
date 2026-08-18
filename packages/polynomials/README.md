# @step-wise/polynomials

Utilities for representing and manipulating multivariable polynomials like `2+4*b+3*a+5*a*b`.


## Installation

```bash
npm install @step-wise/polynomials
```


## Quick start

```ts
import { createPolynomial, polynomialToString } from '@step-wise/polynomials'

const polynomial = createPolynomial(
	[[2, 4], [3, 5]],
	['a', 'b'],
)

polynomialToString(polynomial) // 2+4*b+3*a+5*a*b
```

A constant polynomial has scalar coefficients and no variables:

```ts
const constant = { coefficients: 5, variables: [] }
```


## Creation and validation

- `createPolynomial(coefficients, variables)` creates and validates a polynomial.
- `createConstantPolynomial(value)` creates a constant polynomial.
- `ensurePolynomial(value)` validates an existing value and returns it unchanged.


## Manipulation

- `negatePolynomial(polynomial)` returns `-f`.
- `scalePolynomial(polynomial, factor)` multiplies every coefficient by a factor.
- `addConstantToPolynomial(polynomial, value)` changes the constant coefficient.
- `oneMinusPolynomial(polynomial)` returns `1-f`.
- `addPolynomials(polynomials)` adds one or more polynomials.
- `subtractPolynomials(a, b)` returns `a-b`.
- `multiplyPolynomials(polynomials)` multiplies one or more polynomials.
- `raisePolynomialToPower(polynomial, exponent)` expands a non-negative integer power.
- `getPolynomialPowers(polynomial, maxExponent)` returns powers from zero through the maximum (inclusive).

Addition, subtraction, and multiplication accept an optional final variable order.


## Variables and substitution

- `alignPolynomialVariables(polynomial, variables)` reorders coefficients and can add or remove inactive variables.
- `substitutePolynomial(polynomial, values)` substitutes any provided variables and always returns a polynomial.
- `evaluatePolynomial(polynomial, values)` requires every variable and returns a number.
- `substitutePolynomialMoments(polynomial, callback, variables)` calls `callback(variable, exponent)` for each required per-variable moment.


## Comparison and display

- `comparePolynomialCoefficients(a, b)` compares scalar or nested coefficients with floating-point tolerance.
- `comparePolynomials(a, b, options)` compares complete polynomials. Variable reordering is allowed by default; pass `{ allowVariableReordering: false }` to require the same order.
- `polynomialToString(polynomial)` creates a plain-text representation.
