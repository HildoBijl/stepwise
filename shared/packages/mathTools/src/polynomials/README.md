# Polynomials

This folder contains tools to manipulate multi-variable polynomials. Consider for instance `2+3*a+4*b+5*a*b`. These coefficients can be put into a matrix `[[2,4],[3,5]]` and a variable list `['a','b']`. Given multiple polynomials, we can then add, multiply and reshape polynomials.

## Types

The starting point is a `PolynomialExpression`, which is an object of the form
```
const expression = {
	matrix: [[2,4],[3,5]],
	list: ['a','b'],
}
```
So a polynomial expression has a coefficient matrix and a variable list. All functions operate on these matrices, requiring them as inputs and giving them as outputs.

## Display

To easily inspect a polynomial expression, you can use the `polynomialToString(expression)` function. It gives a string like `2+3*a+4*b+5*a*b`.

## Restructuring

To manipulate/restructure polynomials, there are two functions.
- `restructurePolynomial(expression, ['b','a'])` adjusts the order of variables used in an expression. It would give `{ matrix: [[2,3],[4,5]], list: ['a','b'] }`. It throws when an existing variable is not contained in the desired variable list.
- `substituteIntoPolynomial(expression, { a: 3 })` substitutes variables by values. When only some of the variables are given, a new `PolynomialExpression` is given. For the example, this is `{ matrix: [14, 18], list: ['b'] }`. If _all_ variables are given, the result is a number.

## Manipulation through maths

Polynomial expressions can also be manipulated in a variety of ways. This includes:
- `applyMinusToPolynomial(expression)` will multiply all coefficients by `-1`.
- `addConstantToPolynomial(expression, constant)` will add a constant to the polynomial (which only adds it to the very first coefficient).
- `multiplyPolynomialByConstant(expression, constant)` will multiply all coefficients by a constant.
- `oneMinusPolynomial(expression)` will generate the polynomial `1-f(x)`.
- `addPolynomials(expressions, optionalVariableList)` adds up any number of polynomials. Variables don't have to line up. Optionally, a final variable list may be given, which will be conformed to.
- `multiplyPolynomials(expressions, optionalVariableList)` multiplies any number of polynomials. Variables don't have to line up. Optionally, a final variable list may be given, which will be conformed to.
- `polynomialToPower(expression, exponent)` raises a polynomial to a given power expanding brackets.
