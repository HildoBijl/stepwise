# CAS Equations

An `Equation` object is essentially an object with two attributes `left` and `right` that are both `Expression` objects. So to understand the functionalities of the equations, for read about the [expressions](../expressions/).


## Creation

Equation objects are created identically to expression objects, but then there must be an equals sign within the given string.

```
const eq = asEquation('2x+3=11')
```

It is also possible to give two expressions.

```
const exp1 = asExpression('2x+3')
const exp2 = asExpression(11)
const eq = asEquation({ left: exp1, right: exp2 })
```

Interpretation and expression settings can be added in the same way as for expressions. Rendering methods like `str`, `tex` and `tree` also work identically.


## Inspection

The inspection methods work the same as for expressions. There are three extra methods:

- `eq.someSide(check)` checks if (at least) one of the two sides satisfies a given check.
- `eq.everySide(check)` checks if both sides satisfy a given check.
- `eq.findSide(check)` finds the first side (if it exists) that satisfies a given check, or `undefined` otherwise. It returns an object of the form `{ side: theObtainedExpression, sideName: 'left' }`.


## Manipulation

Manipulation is mostly the same as well. Extra methods are:

- `eq.switch()` switches the two sides of the equation.
- `eq.mapSides(mapper)` applies a given mapper function to both sides. You can double both sides of the equation by running `eq.mapSides(side => side.multiplyLeft(2))`. (Although you could also use `eq.multiplyLeft(2)` to do the same.)
- `eq.mapLeft(mapper)` applies a mapper function to only the left side.
- `eq.mapRight(mapper)` applies a mapper function to only the right side.


## Simplification

Simplification is also done in the same way as for expessions. Extra methods are:

- `eq.moveAllToLeft()` turns `2x+3=11-y` into `2x+3-(11-y)`.
- `eq.normalizeToZero()` moves all terms to the left and then normalizes it. This can help to compare equations.


## Comparison

For comparison, the same methods apply. The `equalStructure` function does have an extra option `allowSwitch`.

```
asEquation('2x=3').equalStructure('3=x*2') // Gives true
asEquation('2x=3').equalStructure('3=x*2', false) // With `allowSwitch` set to false, this gives false
asEquation('2x=3').equalStructure('x*2=3', false) // Gives true
asEquation('2x=3').equalStructure('x*2=3', false, false) // With `allowOrderChanges` set to false, this gives false
```

For the `equals` function there are a few more options. This function is once more called using a set of options.

```
asEquation('2x=3').equalStructure('x*2=3', equalityOptions)
```

The `equalityOptions` object can have the following attributes.

- `allowOrderChanges` (default `true`): is `xy` the same as `yx`? (Only used when no `compare` functions are given.)
- `allowSwitch` (default `true`): is `2x=3` the same as `3=2x`? If set to true, the switched version of the second argument will also be compared with the first argument.
- `preprocess`: (default `identity`) an equation mapper function used to preprocess the equation before comparison.
- `preprocessSide`: (default `identity`) an expression mapper function used to preprocess each side before comparison.
- `preprocessLeft`: an expression mapper function used to preprocess the left side before comparison. (If given, then `preprocessSide` must be `undefined`.)
- `preprocessRight`: an expression mapper function used to preprocess the right side before comparison. (If given, then `preprocessSide` must be `undefined`.)
- `compareSide`: (default `equalStructure` with the given `allowOrderChanges` setting) an expression comparison used to see if two sides match. If given, then `allowOrderChanges` is ignored.
- `compareLeft`: an expression comparison used to see if the left sides match. (If given, then `compareSide` must be `undefined`.)
- `compareRight`: an expression comparison used to see if the right sides match. (If given, then `compareSide` must be `undefined`.)

Through this, a variety of equation comparisons can be set up.
