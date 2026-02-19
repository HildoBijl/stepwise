# Working with polynomials

The skill tracking algorithm makes heavy use of polynomials. For instance, if a skill has a set-up `and('a', 'b', 'b', 'c')`, then it requires first subskill `a` to be completed, then twice subskill `b` and finally subskill `c`. If the success rates `a`, `b` and `c` are all known, then the success rate for this skill is `a*b^2*c`. This is the so-called probability polynomial. Every skill set-up can be turned into such a probability polynomial. The files in the folder support that process.

## Storing polynomials as matrices

Consider a polynomial like `2 + 3a + 4a^2`. We can store this polynomial as a list of coefficients, like `[2, 3, 4]`.

For multivariate polynomials this works identically, but we get higher-dimensional matrices. For instance, with `1 + 2a - 3ab + 4b^2` we have the matrix `[[1, 0, 4], [2, -3, 0]]`. For more variables, the dimension of the matrix also grows. General rule is that, to find the coefficient of the term `a^x * b^y * c^z` you need to access matrix element `matrix[x][y][z]`, and identically for any other number of variables.

Corresponding to each polynomial is often a variable list. For instance, for the polynomial `1 + 2a - 3ab + 4b^2`, the variable list would be `['a', 'b']`. The corresponding matrix then equals `[[1, 0, 4], [2, -3, 0]]`. If the variable list would be different, like `['b', 'a']`, then also the matrix would be different, and would then be `[[1,2], [0, -3], [4, 0]]`.

## Displaying polynomials

Polynomial matrices can also be displayed as a string. This is done through `polynomialMatrixToString(matrix, list)`. For instance, `polynomialMatrixToString([[1, 0, 4], [2, -3, 0]], ['a', 'b'])` will result in `1+4*b^2+2*a-3*a*b`. Iteration is performed most slowly to the first variable in the list. First all terms without `a` are shown, then all terms with `a`, then all terms with `a^2`, and so forth.

## Manipulating polynomials

There are various ways to manipulate polynomials. We will discuss the most important ones.

### Basic manipulations

First there are a few basic operations. Consider a polynomial `P = [3, 2]` corresponding to `3 + 2x`.

- `applyMinus(P)` will turn `3+2x` into `-3-2x`.
- `addConstant(P, 4)` will turn `3+2x` into `7+2x`.
- `multiplyByConstant(P, 2)` will turn `3+2x` into `6+4x`.
- `oneMinus(P)` will turn `3+2x` into `-2-2x`, being `1-P`.

### Restructuring and substituting

Another common manipulation method is to change the variable list order. This is known as restructuring, and is applied through `restructure(matrix, originList, destinationList)`. You could for instance apply

```
restructure([[1, 0, 4], [2, -3, 0]], ['a', 'b'], ['b', 'a']))
```

and the result will be `[[1,2], [0, -3], [4, 0]]`. Note that the destination list must contain all variables from the origin list, but it may contain more variables.

Next to restructuring, it is also possible to substitute variables. This can be done in two ways.

- `substituteAll(matrix, values)` substitutes all variables together. For instance, `substituteAll([[1, 0, 4], [2, -3, 0]], [5, 7])` will insert `a = 5` and `b = 7`, giving `102`.
- `substitute(matrix, list, valueObject)` substitutes a part (or all) of the variables. For instance, `substitute([[1, 0, 4], [2, -3, 0]], ['a', 'b'], { a: 3, x: 4 })` will substitute `a = 3` into the polynomial (and ignore the non-existent variable `x`) resulting in `{ matrix: [7, -9, 4], list: ['b'] }` to represent `7 - 9b + 4b^2`.

### Adding and multiplying polynomials

Polynomials can be added and/or multiplied by other polynomials. To add/multiply polynomials, each matrix must be aware of its corresponding variable list. The syntax is then

- `add(matrices, lists, destinationList)`
- `multiply(matrices, lists, destinationList)`

Both functions take an array of polynomial matrices, their corresponding variable lists, and a destination variable list. The result returned will be a plain object of the form `{ matrix, list }` with the resulting polynomial matrix and corresponding variable list. The list will equal the `destinationList`, unless the (optional) `destinationList` is not provided, in which case one is determined automatically.

An example application is to add or multiply the polynomials `2+3a` and `4+5b`. Note that the sum is `6+3a+5b` and the product is `8+10b+12a+15ab`. Defining `P1 = [2,3]` and `P2 = [4,5]`, we then have

- `add([P1, P2], [['a'], ['b']], ['a', 'b'])` gives `{ matrix: [[6,5],[3,0]], list: ['a','b'] }`
- `multiply([P1, P2], [['a'], ['b']], ['a', 'b'])` gives `{ matrix: [[8,10],[12,15]], list: ['a','b'] }`
