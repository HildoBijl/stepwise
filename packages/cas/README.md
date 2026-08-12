# Step-Wise Computer Algebra System

This package contains the Computer Algebra System (CAS) which allows for manipulation expressions, equations and such.


## Usage

The main point of entry is

```
import { asExpression, asEquation } from '@step-wise/cas'
const ex = asExpression('(2x^2+3x+1)/(x^2-1)')
const eq = asEquation('2x+3=9')
```

Once you have an `Expression` or `Equation` object, you have access to a variety of methods. For the exact possibilities, see the respective for [Expression](./src/expressions/Expression.ts) and [Equation](./src/equations/Equation.ts) classes.


## Settings 

The `Expression` and `Equation` objects support `InterpretationSettings` and `ExpressionSettings`.

- `InterpretationSettings` describe how to turn the given input into an expression tree. After interpretation, these settings are not needed anymore and discarded.
- `ExpressionSettings` describe how to handle the expression tree. They are still relevant for given expressions.

You could for instance write

```
const ex = asExpression('2e') // Gives the number "2e" which is roughly 5.44.
const ex = asExpression('2e', { eAsConstant: false }) // Gives the expression "2*e" with e as a variable.
const ex = asExpression('sin(180)') // Will evaluate as -0.80115...
const ex = asExpression('sin(180)', undefined, { degrees: true }) // Will evaluate as 0.
```


## Internals

To understand how the CAS works behind the scenes, you need to follow its hierarchy.

- **[core](./src/core/)** contains all functionalities for defining, manipulating and outputting expressions. However, all this functionality is hidden away behind the scenes.
- **[expressions](./src/expressions/)** contains an `Expression` wrapper that represents an expression. It uses all the core functionalities and attaches it to a class that has useful methods.
- **[equations](./src/equations/)** expands on this by creating a function `Equation` object representing an equation. It has two sides (left and right) which are both expressions.

The CAS makes use of the [math-input-value](../math-input-value/) package for its string parsing. Strings are first turned into a `Math-Input-Value` object, and the CAS then interprets this `Math-Input-Value` object.
