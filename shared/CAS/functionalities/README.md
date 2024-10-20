# Functionalities

For functionalities, there is an important distinction between an `Expression` and an `Equation` object: an Expression object is just a term like `sin(3x)^2` while an Equation object like `a^2+b^2=c^2` has a left and right side with an equals sign in-between.


## Expressions: general properties and functions

Every `Expression` object implements the abstract `Expression` class. It has a variety of properties and functions.

### Properties

Each expression has the following properties to be obtained.

- `str` gives a string representation of the expression.
- `tex` gives LaTeX code for the expression.
- `subtype` gives the Expression subtype, like `Variable`, `Sum` or `Fraction`.

### Manipulation functions

Manipulating functions do something with the expression. The original expression is never adjusted: a clone is always returned.

- `add(exp, putAtStart = false)` adds the expression, resulting in `this + exp` (unless `putAtStart` is set to `true`).
- `subtract(exp)` subtracts the expression, resulting in `this - exp`.
- `multiply(exp)` results in `this*exp`.
- `divide(exp)` results in `this/exp`.
- `applyMinus()` results in `-this`.
- `toPower(exp)` results in `this^(exp)`.
- `invert` results in `this^(-1)`.
- `getDerivative(var)` gives the derivative of the expression with respect to the given variable. For expressions only depending on one variable, this parameter may be omitted.

### Property checking functions (boolean)

There are a couple of basic property checking functions that return `true` or `false`.

- `isSubtype(subtype)` checks if the given expression has the given subtype.
- `dependsOn(var)` checks if the given variable occurs inside this expression.
- `isNumeric()` checks if the expression can be reduced to a number, and hence does not have any variables.
- `hasFloat()` checks if there are any float numbers inside the expression.

On top of this, it is also possible to write custom checks using the following functions.

- `recursiveSome(check, includeSelf = true)` will check this expression and all sub-expressions for a certain check. For instance, a check could be `(exp) => exp.isSubtype('Fraction')` which results in checking if there is any fraction anywhere.
- `recursiveEvery(check, includeSelf = true)` works similarly but then every sub-expression must satisfy the check.

### Substitution functions

When it comes to substitution, the following functions are useful.

- `getVariables()` returns a sorted array of variables inside this expression.
- `substitute(variable, substitution)` replaces a given variable by a substitution. The substitution can be any type of expression, including complex ones.
- `substituteVariables(variableObject)` takes a variable-object like `{ 'x_1': '2+y_1', 'x_2': 'sin(3*y_2)' }` and applies all given substitutions.

### Simplification

Simplification of an `Expression` is done through the `simplify` function, like in `exp.simplify(someOptions)`. There is a huge variety of options to simplify on. For most cases, there are a few default simplify functions that work pretty well.

- `cleanStructure` does not change expression apart from structure. So `(2+(3+4))` might be changed to `2+3+4`.
- `removeUseless` removes useless operations like "plus 0" or "times 1" or "to the power of 1".
- `elementaryClean` slightly rewrites things, to make sure that expressions that are as good as similar count as equal. For instance, it turns `(2/3)x` into `(2x)/3` and it turns `-(a/b)` into `(-a)/b`.
- `basicClean` runs all basic clean-up methods available to starting mathematicians. Numbers like `2*3` are simplified to `6`, fractions within fractions like `(a/b)/c` are squashed, and products like `x*x` are merged into powers.
- `regularClean` also uses tools taught at the end of high school, running more advanced fraction simplifications, power reductions and such. Also terms are sorted into a sensible order.
- `cleanForAnalysis` puts expression, for as much as possible, into a standard form. This subsequently allows for easy equivalence comparison.

If the above is not enough, then see the [Simplify Options source code](../options/simplifyOptions.js) for further options to give to the `simplify` function.


## Expression subtypes

Every Expression inherits form the `Expression` class. There is a whole tree structure behind it.

### Direct descendants

The `Expression` class only has one direct descendant.

- `Variable` represents a variable, like `dot(m)_1`. Variables have a `symbol`, an `accent` (optional) and a `subscript` (optional).

### Constants

When it comes to numbers, the abstract `Constant` class extends the `Expression` class. It in turn has two descendants.

- `Integer` represents an integer number, like `3` or `-5`.
- `Float` represents a floating-point number, like `-2.5` or `3.14`.

### Expression lists

When it comes to addition/multiplication, we use the abstract `ExpressionList` class. Objects from this class have a `terms` property (an array) with terms being inside the list. The `ExpressionList` class has two descendants.

- `Sum` represents an addition of terms like `2+3+x`. Its property `terms` (an array) allows to request these terms. It can be any number of terms.
- `Product` represents a multiplication of terms like `2*3*x`.

### Basic functions

All other types of expressions are a function of some sort. For this, there is the abstract `Function` class.

The two most common multi-argument functions are the following.

- `Fraction` has arguments `numerator` and `denominator`, both being expressions.
- `Power` has arguments `base` and `exponent`, both being expressions.

Below the abstract `Function` class is also the abstract `SingleArgumentFunction`. Descendants only have the `argument` property pointing at the main argument of the function. An example of a descendant is the following.

- `Ln` is the natural logarithm. The `argument` property obviously points at the argument of the function.

Next to the above basic functions, there are various add-ons.

### Roots

The roots functions include the following.

- `Sqrt` is a single-argument function with only the `argument` parameter.
- `Root` is a multi-argument function with parameters `argument` and `base`.

From a mathematical viewpoint, the `Sqrt` function is the `Root` function with base `2`.

### Logarithms

The logarithm functions include the following.

- `Log` is a multi-argument function with parameters `argument` and `base`. By default, a ten-based logarithm is used.

### Trigonometry

The trigonometry functions include the following.

- `Sin` is a single-argument function with only the `argument` parameter. It represents the sine.
- `Cos` is a single-argument function with only the `argument` parameter. It represents the cosine.
- `Tan` is a single-argument function with only the `argument` parameter. It represents the tangent.
- `Arcsin` is a single-argument function with only the `argument` parameter. It represents the arcsine.
- `Arccos` is a single-argument function with only the `argument` parameter. It represents the arccosine.
- `Arctan` is a single-argument function with only the `argument` parameter. It represents the arctangent.


## Equation

An `Equation` object has two important properties `left` and `right`, that are both `Expression` objects.

### Functionalities

Equations have mostly the same functionalities as expressions.

- Mathematical operations like `add`, `subtract`, `multiply`, `divide`, `toPower` and `applyMinus` still work, and will be applied to both sides.
- Substitution-functions like `getVariables`, `substitute` and `substituteVariables` work and are also applied to both sides.
- Simplification functions like `simplify`, `cleanStructure`, `removeUseless`, `elementaryClean`, `basicClean`, `regularClean` and `cleanForAnalysis` all work as usual and act on both sides. The main difference is that an extra simplify option `allToLeft` is available, which brings all terms in an equation to the left.

On top of this, it is also possible to manipulate expressions. For this, you can use the following functions.

- `switch()` will switch the left and right side.
- `applyToBothSides(operation)` takes the operation and applies it to both sides. An example operation is `(exp) => exp.multiply(2)`.
- `applyToLeft(operation)` only applies an operation to the left side.
- `applyToRight(operation)` only applies an operation to the right side.

Finally there are a few useful checking functions.

- `someSide(check)` tries to find a side satisfying the check. Effectively it returns `check(exp.left) || check(exp.right)`.
- `everySide(check)` checks if all sides satisfy the check. Effectively it returns `check(exp.left) && check(exp.right)`.
- `findSide(check)` finds a side satisfying the check. It returns an object of the form `{ part, side, value }` where `part` is `left` or `right`, `side` is the `Expression` object for that side, and `value` is the value given by the check-functino. If none of the sides match, undefined is given.

See the [Equation source code](Equation/Equation.js) for more information about all these functions.


### Comparison and checks

We make a distinction between comparisons and checks: comparisons compare two equations while checks only study the properties of one equation.

#### Comparisons

Example of comparison functions are `exactEqual(equ1, equ2)` and `equivalent(equ1, equ2)`. (The equivalence check is not perfect: it examines a large variety of ways in which the two equations may be equivalent, but may miss complicated equivalences.) See the [Equation comparisons source code](Equation/comparisons.js) for what other comparison methods there are.

Behind the scenes, these methods often first simplify the equation in a certain way. For instance, it may bring an equation `f(x)=g(x)` into a basis form `f(x)-g(x)=0` with a zero on the right side. Then they do an equals-check on the `Expression` objects on both sides of the equation. Checking if both sides of an equation are equal can be done with `equ1.equals(equ2, ...options)`.

#### Checks

Checks take only a single equation and check it for a certain property. For instance, the function `hasFraction(equ1)` searches for the presence of fractions. See the [Equation checks source code](Equation/checks.js)

