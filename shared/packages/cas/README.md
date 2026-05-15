# Step-Wise Computer Algebra System

This package contains the Computer Algebra System (CAS) which allows for manipulation expressions, equations and such.


## Usage

The main point of entry is

```
import { asExpression, asEquation } from '@step-wise/cas'
const exp = asExpression('(2x^2+3x+1)/(x^2-1)')
const eq = asEquation('2x+3=9')
```

Once you have an `Expression` or `Equation` object, you have access to a variety of methods. For the exact possibilities, see the folders for [expressions](./src/expressions/) and [equations](./src/equations/).

It is also possible to add `ExpressionSettings` to an expression or equation. You could for instance use `const exp = asExpression('sin(2x)', { degrees: true })` to make trigonometric functions work with degrees rather than radians.


## Internals

To understand how the CAS works behind the scenes, you need to follow its hierarchy.

- **[core](./src/core/)** contains all functionalities for defining, manipulating and outputting expressions. However, all this functionality is hidden away behind the scenes.
- **[expressions](./src/expressions/)** contains an `Expression` wrapper that represents an expression. It uses all the core functionalities and attaches it to a class that has useful methods.
- **[equations](./src/equations/)** expands on this by creating a function `Equation` object representing an equation. It has two sides (left and right) which are both expressions.

The CAS makes use of the [math-input-value](../math-input-value/) package for its string parsing. Strings are first turned into a `Math-Input-Value` object, and the CAS then interprets this `Math-Input-Value` object.
