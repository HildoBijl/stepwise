# @step-wise/polynomials

Utilities for representing and manipulating sparse multivariable polynomials such as `2+4*b+3*a+5*a*b`. Only nonzero terms are stored.


## Installation

```bash
npm install @step-wise/polynomials
```


## Representation

A polynomial contains an ordered list of variables and a sparse list of terms:

```ts
import type { Polynomial } from '@step-wise/polynomials'

const polynomial: Polynomial = {
	variables: ['a', 'b'],
	terms: [
		{ coefficient: 2, exponents: [0, 0] },
		{ coefficient: 4, exponents: [0, 1] },
		{ coefficient: 3, exponents: [1, 0] },
		{ coefficient: 5, exponents: [1, 1] },
	],
}
```

Each exponent corresponds to the variable at the same index. For example, `{ coefficient: 5, exponents: [1, 1] }` represents `5*a*b`.

Polynomials use a canonical shape:

- Terms have nonzero, finite coefficients.
- Exponents are non-negative safe integers.
- Every term has one exponent per variable.
- Terms are unique and sorted by their exponent arrays.
- The zero polynomial has no terms. It may retain a variable list, while `createConstantPolynomial(0)` produces `{ terms: [], variables: [] }`.
- A nonzero constant has no variables and one term, such as `{ terms: [{ coefficient: 5, exponents: [] }], variables: [] }`.

Use `createPolynomial` instead of assembling this shape manually. It validates the input, combines like terms, removes zero terms and sorts the result.


## Quick start

```ts
import { createPolynomial, evaluatePolynomial, polynomialToString } from '@step-wise/polynomials'

const polynomial = createPolynomial([
	{ coefficient: 2, exponents: [0, 0] },
	{ coefficient: 4, exponents: [0, 1] },
	{ coefficient: 3, exponents: [1, 0] },
	{ coefficient: 5, exponents: [1, 1] },
], ['a', 'b'])

polynomialToString(polynomial) // 2+4*b+3*a+5*a*b
evaluatePolynomial(polynomial, { a: 2, b: 3 }) // 50
```


## Creation and validation

- `createPolynomial(terms, variables)` creates a canonical sparse polynomial.
- `createConstantPolynomial(value)` creates a constant polynomial.
- `ensurePolynomial(value)` validates that a value is a canonical polynomial and returns it.
- `ensurePolynomialVariables`, `ensurePolynomialExponents` and `ensurePolynomialTerm` validate the corresponding constituent types.


## Manipulation

- `negatePolynomial(polynomial)` returns `-f`.
- `scalePolynomial(polynomial, factor)` multiplies every coefficient by a factor.
- `addConstantToPolynomial(polynomial, value)` changes the constant term.
- `oneMinusPolynomial(polynomial)` returns `1-f`.
- `addPolynomials(polynomials, variables?)` adds one or more polynomials.
- `subtractPolynomials(a, b, variables?)` returns `a-b`.
- `multiplyPolynomials(polynomials, variables?)` multiplies one or more polynomials.
- `raisePolynomialToPower(polynomial, exponent)` expands a non-negative integer power.
- `getPolynomialPowers(polynomial, maxExponent)` returns powers from zero through the maximum, inclusive.

The optional `variables` argument on addition, subtraction and multiplication determines the variable order of the result. Without it, the functions derive an order from their operands.


## Variables, substitution and moments

- `alignPolynomialVariables(polynomial, variables)` changes the variable order and can add or remove inactive variables.
- `substitutePolynomial(polynomial, values)` substitutes the provided variables and returns the remaining polynomial.
- `evaluatePolynomial(polynomial, values)` requires a value for every variable and returns a number.
- `substitutePolynomialMoments(polynomial, getMoment, variables?)` substitutes independent moments returned by `getMoment(variable, exponent)`.

Moment substitution uses the independence identity `E[X^a * Y^b] = E[X^a] * E[Y^b]`. Moments requested more than once during one substitution are cached.


## Comparison and display

- `comparePolynomialTerms(a, b)` compares two canonical term lists with floating-point tolerance for coefficients.
- `comparePolynomials(a, b, options?)` compares complete polynomials. Variable reordering is allowed by default; pass `{ allowVariableReordering: false }` to require the same order.
- `polynomialToString(polynomial)` creates a plain-text representation.


## Dense univariate conversion

`getUnivariatePolynomialCoefficients(polynomial)` converts a polynomial with exactly one variable to a dense coefficient array ordered by exponent. Missing powers become zeroes:

```ts
import { createPolynomial, getUnivariatePolynomialCoefficients } from '@step-wise/polynomials'

const polynomial = createPolynomial([
	{ coefficient: 2, exponents: [0] },
	{ coefficient: 5, exponents: [3] },
], ['x'])

getUnivariatePolynomialCoefficients(polynomial) // [2, 0, 0, 5]
```

This helper is intended for interoperability with APIs that require dense univariate coefficients. It rejects constant and multivariable polynomials.
