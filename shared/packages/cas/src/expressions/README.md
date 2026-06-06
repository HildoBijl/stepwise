# CAS Expressions

This ReadMe describes most of the possibilities that CAS Expressions have.


## Creation

An `Expression` object is usually created through the `asExpression` function.

```
import { asExpression } from '@step-wise/cas'
const exp = asExpression('(2x^2+3x+1)/(x^2-1)')
```

When doing so, it's possible to add interpretation options and expression options.


### Rendering

To see what you have created, it's possible to show the expression in various ways.

- `exp.toString()` or `exp.str` gives a string representation of the expression. It can be fed back into `asExpression` if desired.
- `exp.toTex()` or `exp.tex` gives a LaTeX representation.
- `exp.toTree()` or `exp.tree` turns the expression into a tree structure (a string) of the form `sum(product(2, 'x'), 5)`.

They are helpful at inspecting any expressions.


### Interpretation settings

When setting up expressions, you can add interpretation settings. These are settings that are crucial during interpretation, but are irrelevant and will be discarded once the expression tree has been set up. See the [respective file](../../../math-input-value/src/settings/interpretationSettings.ts) for the documentation.

Example usage is as follows.

```
const ex = asExpression('2e') // Gives the number "2e" which is roughly 5.44.
const ex = asExpression('2e', { eAsConstant: false }) // Gives the expression "2*e" with e as a variable.
```


### Expression settings

When setting up expressions, you can add expression settings. These are settings that will be relevant in deciding the behavior of the expression tree. See the [respective file](../../../math-input-value/src/settings/interpretationSettings.ts) for the documentation.

Example usage is as follows.

```
const ex = asExpression('sin(180)') // Will evaluate as -0.80115...
const ex = asExpression('sin(180)', undefined, { degrees: true }) // Will evaluate as 0.
```


## Inspection

To see what kind of expression you have, there is a huge variety of inspection methods.


### Type checks

You can run type checks to find what type of expression is at the top-level of the expression tree. For instance, for `const exp = asExpression('2*x+5')` we can run `exp.isSum()` which will give `true`. Other checks include `isInteger`, `isNamedConstant` (for `e`, `pi`, etcetera), `isVariable`, `isMinus`, `isProduct`, `isFraction`, `isPower`, `isRoot`, `isSqrt`, `isRootFunction`, and many more.

It is important to know that the CAS only works with positive numbers. Any minus sign comes from a minus object. So `-8` is stored as `minus(integer(8))`. Similarly, `-8x` can be stored as either `minus(product(integer(8), 'x'))` or as `product(minus(integer(8)), 'x')`.


### Attributes

Each type has various attributes. For instance, a sum has terms, a product has factors, a fraction has a numerator and denominator, a power has a base and an exponent, and a root has a radicand and a degree.

To get these attributes, just request them, like through `exp.terms` or `exp.numerator`. This will give the resulting expression(s).

Important: if you request an attribute that doesn't exist, like the numerator of a sum, then an error is thrown. So check your types first!


### Property checks

There are a variety of other properties that can be checked too. These include value checks like `isZero`, `isOne`, `isPositiveInteger`, etcetera. They also include properties like `isNumeric`, `isPolynomial` or `isRational`. We can also check the dependencies through `exp.getVariables()` (gives a list of `Variable` expressions that are present in the equation) or `exp.dependsOn(asExpression('x'))` which checks if the expression depends on a variable.


### Recursive checks

We can also run checks on all children in the expression tree. Functions like `exp.some(...)` and `exp.every(...)` require an expression checking function. We could for instance recreate the `dependsOn` function through

```
const x = asExpression('x')
exp.some(child => child.equalStructure(x)) // exp depends on x.
```

Other functions are `exp.find(...)` and `exp.findAll(...)` which take a check and find the first (or all) of the children in the expression tree for which the check returns true.


## Manipulation

There are many ways to change an expression. When you do, a new expression is always returned. That is, unless no change is made, in which case the same object is returned to maintain reference equality.


### Algebraic operations

The most common manipulations are algebraic operations. You can for instance write `exp1.add(exp2)`. Other operations include `addLeft`, `subtract`, `multiply`, `multiplyLeft`, `divide`, `toPower`, `asExponentOf`, `negate` (put minus sign around), `abs` (remove potential minus sign), `sqrt`, `ln`, `sin`, etcetera.


### Substitutions

Substitutions are done through the `substitute` function. This function can be called in multiple different ways.

- With a variable and a value: `exp.substitute('x', '2y')`. (Arguments may be strings, in which case they are instantly passed on to `asExpression`.)
- Only give a new value: `exp.substitute('2y')`. This only works for expressions with a single variable. Otherwise an error is thrown.
- Give lists of variables/substitutions: `exp.substitute(['x', 'y', 'z'], ['2*a', '3*b', '4*c'])`.
- Give an object with substitutions: `exp.substitute({ x: '2*a', y: '3*b', z: '4*c' })`.

An alternative is the `evaluateAt` function. This works just like `substitute`, but it assumes that afterwards the expression has no variables left and is numeric. It will then use the `exp.toNumber()` (or `exp.value`) call to extract the given number and return that.


### Argument mapping

It may happen that we want to apply some operation to the numerator of a fraction. In that case, we can use argument mappings. We can do so for instance through:

```
exp.mapNumerator(child => child.multiply(3).subtract(5))
```

The given expression mapping takes an `Expression` and returns an `Expression`. The mapper then makes sure it's applied to the right element, and a new `Expression` is returned. Applying the above to `x/(2*y)` will result in `(3*x+5)/(2*y)`.

The mappers that exist depend on the expression type. Sums have `mapTerms`, fractions have `mapFactors`, a power has `mapBase` and `mapExponent`, the natural logarithm and the minus sign have `mapArgument`, roots have `mapRadicand` and `mapDegree`, etcetera.


### Recursive mapping

Sometimes you want to apply an operation to every child in the expression tree. For this, you can use `mapEvery`. This function takes a mapper and applies it to every child. We could for instance set all exponents within powers to zero. This can be done in multiple ways.

```
exp.mapEvery(child => child.isPower() ? child.mapExponent(() => 0) : child)
exp.mapEvery((child, ancestors) => ancestors[ancestors.length-1]?.isPower() ? 0 : child)
```

Both of the above lines do the same thing. Note that we can simply insert `0` since this is passed through `asExpression` anyway. Also note that the mappers receive a second parameter: the list of ancestors of the given child, with the closest ancestors last. (And `ancestors[0]` equals `exp`, except when the mapper is applied to `exp` itself.)


## Simplification

The core of the CAS is rewriting/simplifying expressions. As a result, there are dozens op options to do so. We'll go over the various possibilities.


### Using simplification options directly

There are dozens of things you can do with an expression. You could for instance flatten sums, turning `(2+3)+5` into `2+3+5`. Or you can cancel sum terms, turning `2x+5-2x` into `5`. The [list of all simplification options](../core/operations/simplification/simplificationOptions/allSimplificationOptions.ts) is long, but it's worthwhile to go through it.

To apply some simplification options, there is the `simplify` function. You could for instance write

```
exp.simplify(['flattenSums', 'flattenProducts'])
```

This keeps on applying the given operations until nothing changes.

Some simplification options have requirements: they need other options to be present too. For instance, to merge fraction sums like `1/2 + 1/3`, it is necessary to also merge fraction products. After all, what should otherwise be done with `1/2 + 1/5*5/3`? If the `simplify` function is given `mergeFractionSums` without getting `mergeFractionProducts` an error is thrown.

Other simplification options have conflicts: they may not be present together with other options. For instance, `splitFractions` which turns `(x+y)/2` into `x/2+y/2` may not be present together with `mergeFractions` which does the opposite. If both would be present, the simplification would be stuck in an infinite loop. To prevent this, an error is thrown when two confliction simplification options are both present.


### Using simplification presets

Usually, you just want to simplify an expression, applying a large amount of simplification options at the same time. To accomplish this, we have various presets of simplification options defined.

- `exp.flatten()`: flattens sums and products. (So doesn't do much at all, really.)
- `exp.removeTrivial()`: includes `flatten` and also removes all trivial things like adding 0, multiplying by 1, turning x^0 into 1, etcetera.
- `exp.mergeNumbers()`: includes `removeTrivial` and also reduces all numbers as much as possible. So it adds numbers in sums together, multiplies numbers in products, turns `2^3` into `8`, and turns `16/10` into `8/5`.
- `exp.cancel()`: includes `mergeNumbers` and also cancels terms/factors where possible. This only includes direct cancellations. So `2x+5-2x` is turned into `5`, but `2x+5-3x` is left unchanged. Similarly, `(ax+bx)/(cx)` is turned into `(a+b)/c` and `root[n](x^n)` is turned into `n`.
- `exp.combine()`: includes `cancel` and also combines terms/factors where possible. This changes `2x+5-3x` into `5-x` and turns `x^5/x^2` into `x^3`.
- `exp.expand()`: includes `combine` and also expands brackets where possible. So it turns `2(x+5)` into `2x+10`, it turns `(3x)^2` into `9x^2` and it turns `(x+2)^3` into `x^3+6x^2+12x+8`.
- `exp.sort()`: does nothing else, other than sorting sums and products in a certain way. So `2+x` becomes `x+2` and `y*2*x` becomes `2*x*y`.
- `exp.normalize()`: includes `expand` and `sort` and takes various extra steps, like normalizing minus signs in fractions, turning roots into powers, etcetera. Ideally, two expressions that are equivalent always normalize to exactly the same outcome.

Then there are two special presets, sometimes used for post-processing.

- `exp.factorize()`: contrary to `expand`, this preset tries to pull as much as possible within brackets. It turns `2x+2y` into `2(x+y)`.
- `exp.format()`: tries to make the expression cleaner to display. For this, it does a bit of factorizing, turning `2x+2y` into `2(x+y)` and `sqrt(4x)` into `2sqrt(x)`. It also turns fractional powers back into roots.

It often happens that a preset is almost what you want, but not quite. In that case, you can adapt it, for instance by adding options or removing them.

```
exp.mergeNumbers(['sortSums', 'sortProducts'], ['mergeFractionNumbers']) // Do sort sums/products, but don't turn 16/10 into 8/5.
```


## Comparison

There are many ways in which to compare two expressions. You could for instance run type checks and such on them. But to compare for equality, there are a few extra methods.


### Equal structure

The most common way to check for equality, is through its structure. When doing so, order changes in sums/products are usually accepted. (After all, sorting sums/products isn't always fully deterministic: the outcome may depend on the initial sorting.)

```
asExpression('2x').equalStructure('x*2') // Gives true
asExpression('2x').strictEqualStructure('x*2') // Gives false
```


### Equivalence

Often, we just want to check for equivalency.

```
asExpression('(x+3)^2').equivalent('x^2+6x+18/2') // Gives true
```

This basically runs a `normalize` simplification on both expressions and then checks the structure. So getting `true` guarantees equivalence, but getting `false` does not guarantee non-equivalence. For instance, `asExpression('sin(x)^2+cos(x)^2').equivalent(1)` is likely to not be detected.


### General equality

The above steps can also be done through the `equals` function which requires options.

```
asExpression('(3x)^2').equals('9x^2', { preprocess: exp => exp.combine(), allowOrderChanges: true }) // Gives true
```

By default, the `equals` function uses the same options as `equalStructure`, but by adding `normalize` as preprocessing step, we can turn it into `equivalent` as well. The possibilities are a bit larger here.


### Other comparisons

Other comparison checks are `isIntegerMultiple` and `isConstantMultiple`.

```
asExpression('4(x+2x^2)').isIntegerMultiple(asExpression('2x+4x^2')) // Gives true
asExpression('3(x+2x^2)').isIntegerMultiple(asExpression('2x+4x^2')) // Gives false
asExpression('4(x+2x^2)').isConstantMultiple(asExpression('2x+4x^2')) // Gives true
asExpression('x(x+2x^2)').isConstantMultiple(asExpression('2x+4x^2')) // Gives false
```


## Other operations

The amount of other operations for the CAS is still growing. The CAS remains a work in progress. For now, there are the following features.


### Derivatives

To get a derivative, we call `getDerivative` with the variable we want to take the derivative of. (If there is only one variable, it may be ommitted.)

```
asExpression('3x^2').getDerivative('x') // Gives 3*2x^(2-1)
```

Note that `getDerivative` does not do any simplification, so it's wise to run a `combine` call after, or alternatively `exp.getDerivative('x').normalize().format()`.

To get the derivative with respect to all variables, use `exp.getGradient()`. This gives an array of expressions. The order of the derivative entries will equal the order of the variables in `exp.getVariables()`.
